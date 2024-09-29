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
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
            // const fullPath = path.join(workspaceFolder || "", data.filePath);
            const fullPath = data.fullPath;
    
            const document = await vscode.workspace.openTextDocument(fullPath);
            const editor = await vscode.window.showTextDocument(document);
    
            // Use the line number from the data to reveal the line
            if (data.line !== undefined && data.word) {
                const lineNumber = Number(data.line);
                const lineText = document.lineAt(lineNumber - 1).text;  // -1 because lines are 0-based in the editor
    
                // Find the index of the word in the line
                const wordIndex = lineText.indexOf(data.word);
    
                if (wordIndex !== -1) {
                    // Highlight the word by setting the start and end positions
                    const startPos = new vscode.Position(lineNumber - 1, wordIndex);  // Line number needs to be zero-based
                    const endPos = new vscode.Position(lineNumber - 1, wordIndex + data.word.length);
                    const range = new vscode.Range(startPos, endPos);
    
                    // Set the selection to the word and reveal the range
                    editor.selection = new vscode.Selection(startPos, endPos);
                    editor.revealRange(range, vscode.TextEditorRevealType.InCenter);  // Reveal the word in the center of the editor
                } else {
                    vscode.window.showInformationMessage(`Word "${data.word}" not found on line ${lineNumber}`);
                }
            } else {
                vscode.window.showInformationMessage("Line number or word not provided");
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error opening document: ${error}`);
        }
    }

      if (data.length > 1 && vscode.workspace.workspaceFolders !== undefined) {
        let searchTerm = data[0].value;
        let searchType = data[1].value;
        let editDistance = data[2].value;
        if (editDistance === "") {
          editDistance = 2;
        }
        let path = vscode.workspace.workspaceFolders[0].uri.path.substring(1);
        /*  */

        const backendFactory = BackendFactory.getInstance();
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
            if (searchTerm.length / 2 > parseInt(editDistance)) {
              let fuzzyQuery = queryFactory.createQuery(
                searchTerm.toLocaleLowerCase() + "/" + editDistance,
                AlgorithmEnum.Fuzzy
              );
              let fuzzyBackend = backendFactory.getBackend(AlgorithmEnum.Fuzzy);
              if (fuzzyQuery !== null) {
                const result = fuzzyQuery && fuzzyBackend?.handle(fuzzyQuery);
                if (result && webviewView.webview) {
                  console.log(result.results);
                  webviewView.webview.postMessage({
                    type: "searchResults",
                    results: result.results,
                  });
                }
              }
            } else {
              console.log("TOO SHORT");
              webviewView.webview.postMessage({
                type: "errorScreen",
                results: "Search Query too Short for given Edit Distance",
              });
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
    const jsLogoUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "media",
        "icons",
        "results",
        "javascript.svg"
      )
    );
    const cssLogoUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "media",
        "icons",
        "results",
        "css.svg"
      )
    );
    const htmlLogoUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "media",
        "icons",
        "results",
        "html.svg"
      )
    );
    const jsonLogoUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "media",
        "icons",
        "results",
        "json.svg"
      )
    );
    const tsLogoUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "media",
        "icons",
        "results",
        "typescript.svg"
      )
    );
    const pyLogoUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "media",
        "icons",
        "results",
        "python.svg"
      )
    );
    const defaultLogoUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "media",
        "icons",
        "results",
        "default.svg"
      )
    );

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
body {
                background-color: #1e1e1e;
                color: #d4d4d4;
                padding: 10px;
            }
                .label {
    display: block;
    margin-bottom: 5px;
}

.txt-box {
    width: 100%;
    flex: 70%; /* Ensure the input takes 70% of the container */
}

.search-select {
    flex: 30%; /* Ensure the select takes 30% of the container */
    padding: 5px;
}
    .file-container {
    border: 1px solid #3c3c3c;
    background-color: #1e1e1e;
    padding: 10px;
    margin-bottom: 15px;
    border-radius: 4px;
}

.file-details {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.file-icon {
    margin-right: 10px;
}

.filename {
    font-weight: bold;
    color: #d4d4d4;
}

.distance-container {
    margin-top: 10px;
    padding: 10px;
    background-color: #2d2d2d;
    border-radius: 4px;
}

.distance-label {
    font-weight: bold;
    margin-bottom: 5px;
    color: #cccccc;
}

.matches-container {
    margin-left: 10px;
}

.code-snippet {
    padding: 5px;
    margin-bottom: 5px;
    background-color: #333333;
    border-radius: 4px;
    color: #e0e0e0;
}

.line-number {
    color: #569cd6;
    margin-right: 5px;
}

.show-more-button, .show-less-button {
    background-color: #007acc;
    color: #ffffff;
    border: none;
    padding: 5px 10px;
    margin-top: 10px;
    cursor: pointer;
    border-radius: 4px;
    font-size: 12px;
}

.show-more-button:hover, .show-less-button:hover {
    background-color: #005f9e;
}


            .result-container {
                background-color: #1e1e1e;
                border: 1px solid #3c3c3c;
                border-radius: 4px;
                padding: 10px;
                margin: 10px 0;
                cursor: pointer;
            }
            .result-container:hover {
                background-color: #2d2d2d;
            }
            .file-details {
                display: flex;
                align-items: center;
                margin-bottom: 5px;
            }
            .file-icon {

            }
            .filename {
                font-weight: bold;
            }
            .code-snippet {
                background-color: #252526;
                padding: 5px;
                border-radius: 3px;
                white-space: pre;
            }
            .line-number {
                color: #569cd6;
                margin-right: 10px;
            }
                .file-icon-img {
    width: 20px;
    height: 20px;
    margin-right: 8px;
    vertical-align: middle;
}
          </style>
           </head>
           <body>
              <div style="display: flex; flex-direction: column; gap: 10px;">
  
              <!-- Label and Flex Container for Input and Select -->
              <div style="display: flex; gap: 10px; align-items: center;">
                <!-- Search Term Input -->
                <input 
                  type="text" 
                  class="txt-box p-2 border border-gray-300 rounded" 
                  id="searchmastervalueid" 
                  name="searchmastervaluename" 
                  placeholder="Enter search term..." 
                  style="flex: 70%;" >

                <select
                  id="searchmastereditdistanceid"
                  class="search-select h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline"
                  name="searchEditDistanceSelect"
                  style="flex: 30%;color: black;" >
                  <option value="0">0 (exact)</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
            </div>
                <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    ></path>
                  </svg>
                </div>
              </div>
                <button type="button" class="btn-search mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Search !</button><br>

              <div id="output" class="output-container mt-4 rounded shadow"></div>
          </div>
              <script nonce="${nonce}" src="${scriptUri}"></script>
              <script>const jsLogoPath = "${jsLogoUri}";</script>
              <script>const cssLogoPath = "${cssLogoUri}";</script>
              <script>const htmlLogoPath = "${htmlLogoUri}";</script>
              <script>const jsonLogoPath = "${jsonLogoUri}";</script>
              <script>const tsLogoPath = "${tsLogoUri}";</script>
              <script>const pyLogoPath = "${pyLogoUri}";</script>
              <script>const defaultLogoPath = "${defaultLogoUri}";</script>
           </body>
        </html>`;
  }
}
