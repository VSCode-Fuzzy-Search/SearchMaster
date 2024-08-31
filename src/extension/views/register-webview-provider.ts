import {
  CancellationToken,
  commands,
  ExtensionContext,
  OutputChannel,
  Uri,
  Webview,
  WebviewView,
  WebviewViewProvider,
  WebviewViewResolveContext,
  window,
} from "vscode";
import { getNonce } from "../util";
import * as vscode from "vscode";
import BackendFactory from "../backend/algorithms/information-retrieval/BackendFactory";
import QueryFactory from "../backend/queries/QueryFactory";
import { AlgorithmEnum } from "../backend/AlgorithmEnum";
import BooleanQuery from "../backend/queries/BooleanQuery";
import BooleanBackend from "../backend/algorithms/information-retrieval/Boolean/BooleanBackend";
import QueryResponse from "../backend/results/QueryResponse";
import MockQueryResponse from "../backend/results/MockQueryResponse";
import path = require("path");

export function readSelectedOrAllText(op: OutputChannel) {
  op.clear();
  const { activeTextEditor } = window;
  let txt = "";
  if (
    !activeTextEditor ||
    activeTextEditor.document.languageId !== "javascript"
  ) {
    op.appendLine("no active found");
  } else {
    txt = activeTextEditor.document.getText(activeTextEditor.selection);
    if (!txt) {
      txt = activeTextEditor.document.getText();
    }
    op.appendLine(txt);
  }
  op.show();
  return txt;
}

export function registerWebViewProvider(
  context: ExtensionContext,
  op: OutputChannel
) {
  const provider = new SidebarWebViewProvider(context.extensionUri, context);
  context.subscriptions.push(
    window.registerWebviewViewProvider("search-master-sidebar-panel", provider)
  );

  context.subscriptions.push(
    commands.registerCommand("searchmaster.print.editor.menu", () => {
      const txt = readSelectedOrAllText(op);
      provider.view?.webview.postMessage({
        type: "transferDataFromTsToUi",
        data: txt,
      });
    })
  );
}

const algorithmEnumMapping: { [key: string]: AlgorithmEnum } = {
  boolean: AlgorithmEnum.Boolean,
  vector: AlgorithmEnum.Vector,
  language: AlgorithmEnum.LanguageModel,
  fuzzy: AlgorithmEnum.Fuzzy,
};

export class SidebarWebViewProvider implements WebviewViewProvider {
  constructor(
    private readonly _extensionUri: Uri,
    public extensionContext: ExtensionContext
  ) {}
  view?: WebviewView;

  resolveWebviewView(
    webviewView: WebviewView,
    webViewContext: WebviewViewResolveContext,
    token: CancellationToken
  ) {
    this.view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      if (data.type === "search-change") {
        switch (data.value) {
          case "boolean":
            webviewView.webview.postMessage({
              type: "searchDescription",
              description:
                "Boolean search is a type of search allowing users to combine keywords with operators (or modifiers) such as AND, NOT and OR to further produce more relevant results.",
            });
            break;
          case "language":
            webviewView.webview.postMessage({
              type: "searchDescription",
              description:
                "Language model search is a type of search that ranks documents based on the likelihood or how much relevant of a query appearing in a document. This kind of search also considers word order and context.",
            });
            break;
          case "vector":
            webviewView.webview.postMessage({
              type: "searchDescription",
              description:
                "Vector search is a type of search that uses vectors to represent documents and queries. It helps ranking documents based on relevance to a query.",
            });
            break;
          case "fuzzy":
            webviewView.webview.postMessage({
              type: "searchDescription",
              description:
                "Fuzzy search is a type of search that searches for text that matches a term closely instead of exactly. Fuzzy searches help you find relevant results even when the search terms are misspelled.",
            });
            break;
          default:
            vscode.window.showInformationMessage("Search type not found");
            break;
        }
      }

      if (data.command === "openFile") {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        const fullPath = path.join(workspaceFolder || "", data.filePath);
    
        const document = await vscode.workspace.openTextDocument(fullPath);
        const editor = await vscode.window.showTextDocument(document);
    
        // Highlight the word if specified
        if (data.word) {
            const wordPosition = document.getText().indexOf(data.word);
            if (wordPosition !== -1) {
                const startPos = document.positionAt(wordPosition);
                const endPos = document.positionAt(wordPosition + data.word.length);
                const range = new vscode.Range(startPos, endPos);
    
                // Set the selection and reveal the range
                editor.selection = new vscode.Selection(startPos, endPos);
                editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
            }
        }
    }

      if (data.length > 1 && vscode.workspace.workspaceFolders !== undefined) {
        let searchTerm = data[0].value;
        let searchType = data[1].value;
        let editDistance = data[2].value;
        if (editDistance === "") {
          editDistance = 2;
        }
        console.log(data);
        let path = vscode.workspace.workspaceFolders[0].uri.path.substring(1);
        /*  */

        const backendFactory = new BackendFactory();
        backendFactory.createAllBackends(path);
        console.log(path);

        const queryFactory = new QueryFactory();

        switch (searchType) {
          case "boolean":
            let booleanQuery = queryFactory.createQuery(
              searchTerm,
              AlgorithmEnum.Boolean
            );
            let booleanBackend = backendFactory.getBackend(
              AlgorithmEnum.Boolean
            );
            if (booleanQuery !== null) {
              const result =
                booleanQuery && booleanBackend?.handle(booleanQuery);
              if (result && webviewView.webview) {
                webviewView.webview.postMessage({
                  type: "searchResults",
                  results: result.results,
                });
              }
            }
            break;
          case "vector":
            let vectorQuery = queryFactory.createQuery(
              searchTerm,
              AlgorithmEnum.Vector
            );
            let vectorBackend = backendFactory.getBackend(AlgorithmEnum.Vector);
            if (vectorQuery !== null) {
              const result = vectorQuery && vectorBackend?.handle(vectorQuery);
              if (result && webviewView.webview) {
                webviewView.webview.postMessage({
                  type: "searchResults",
                  results: result.results,
                });
              }
            }
            break;
          case "language":
            let languageQuery = queryFactory.createQuery(
              searchTerm,
              AlgorithmEnum.LanguageModel
            );
            let languageBackend = backendFactory.getBackend(
              AlgorithmEnum.LanguageModel
            );
            if (languageQuery !== null) {
              const result =
                languageQuery && languageBackend?.handle(languageQuery);
              if (result && webviewView.webview) {
                webviewView.webview.postMessage({
                  type: "searchResults",
                  results: result.results,
                });
              }
            }
            break;
          case "fuzzy":
            let fuzzyQuery = queryFactory.createQuery(
              searchTerm + "/" + editDistance,
              AlgorithmEnum.Fuzzy
            );
            let fuzzyBackend = backendFactory.getBackend(AlgorithmEnum.Fuzzy);
            if (fuzzyQuery !== null) {
              const result = fuzzyQuery && fuzzyBackend?.handle(fuzzyQuery);
              if (result && webviewView.webview) {
                webviewView.webview.postMessage({
                  type: "searchResults",
                  results: result.results,
                });
              }
            }
            break;
          default:
            vscode.window.showInformationMessage("Search type not found");
            break;
        }
      }
    });
  }

  // targetWord

  private _getHtmlForWebview(webview: Webview) {
    const styleResetUri = webview.asWebviewUri(
      Uri.joinPath(this._extensionUri, "media", "css", "reset.css")
    );
    const scriptUri = webview.asWebviewUri(
      Uri.joinPath(this._extensionUri, "media", "js", "search-master-panel.js")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      Uri.joinPath(this._extensionUri, "media", "css", "vscode.css")
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
        <html lang="en">
            <head>
              <meta charset="UTF-8">
              <!--
                 Use a content security policy to only allow loading images from https or from our extension directory,
                 and only allow scripts that have a specific nonce.
                 -->
              <meta http-equiv="Content-Security-Policy"
               content="
                 img-src ${webview.cspSource}
                 style-src ${webview.cspSource}
                 script-src 'nonce-${nonce}';">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
              <link href="${styleResetUri}" rel="stylesheet">
              <link href="${styleVSCodeUri}" rel="stylesheet">
              <script nonce="${nonce}"></script>
              <style>
            .output-container {
              border: 1px solid #ddd;
              border-radius: 4px;
              padding: 16px;
              margin-top: 16px;
              background-color: #5D3FD3;
            }
            .output-container p:last-child {
              border-bottom: none;
            }
            .output-container .output-title {
              font-weight: bold;
              margin-bottom: 8px;
            }
          </style>
           </head>
           <body>
              <input type="text" class="txt-box w-full p-2 border border-gray-300 rounded mb-2" id="searchmastervalueid" name="searchmastervaluename" placeholder="Enter search term..."><br>
              <label for="searchType" class="block text-sm">Choose a search type:</label>
                <div class="relative inline-block w-full text-gray-700" style="display: flex; gap: 10px;">
                <select
                  id="searchType"
                  class="search-select w-full h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline"
                  name="searchTypeSelect"
                  style="flex: 3;"
                >
                  <option value="boolean">Boolean</option>
                  <option value="language">Language Model</option>
                  <option value="vector">Vector Space Model</option>
                  <option value="fuzzy">Fuzzy</option>
                </select>

                <select
                  id="searchmastereditdistanceid"
                  class="search-select w-full h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline"
                  name="searchEditDistanceSelect"
                  style="flex: 1;"
                >
                  <option value="0">0 (exact)</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
                <br>
                <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    ></path>
                  </svg>
                </div>
              </div>
                <div id="searchDescription" class="mt-2 text-sm">
                Boolean search is a type of search allowing users to combine keywords with operators (or modifiers) such as AND, NOT and OR to further produce more relevant results.
                </div>
                <button type="button" class="btn-search mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Search !</button><br>

              <div id="output" class="output-container mt-4 rounded shadow"></div>
              <div id="searchResults" class="output-container mt-4 rounded shadow"> Open register-webview-provider.ts at 'vector'</div>
          </div>
              <script nonce="${nonce}" src="${scriptUri}"></script>
           </body>
        </html>`;
  }
}