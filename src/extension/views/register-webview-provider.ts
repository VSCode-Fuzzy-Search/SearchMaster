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
import { CenterPanel } from "./register-center-panel";
import * as vscode from "vscode";
import BackendFactory from "../backend/algorithms/information-retrieval/BackendFactory";
import QueryFactory from "../backend/queries/QueryFactory";
import { AlgorithmEnum } from "../backend/AlgorithmEnum";
import BooleanQuery from "../backend/queries/BooleanQuery";
import BooleanBackend from "../backend/algorithms/information-retrieval/Boolean/BooleanBackend";
import QueryResponse from "../backend/results/QueryResponse";

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
    "boolean": AlgorithmEnum.Boolean,
    "vector": AlgorithmEnum.Vector,
    "language": AlgorithmEnum.LanguageModel
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
        this.extensionContext.secrets.store("searchmasterCacheKey", data.value);
        const searchType: string = await this.extensionContext.secrets.get("searchType") ?? "";
        const keyword = data.value;
        const backendFactory = new BackendFactory();
        try {
            vscode.window.showInformationMessage(
              "Search triggered with term: " + keyword
            );
            vscode.window.showInformationMessage("Search type: " + searchType);
          } catch (error) {
            // Handle any errors that occur during the command execution
            vscode.window.showInformationMessage(
              "Error triggering search: " + error
            );
          }
        backendFactory.createAllBackends("src/extension/backend/documents");
            const queryFactory = new QueryFactory();
            const algorithm = algorithmEnumMapping[searchType || "boolean"];
            const query = queryFactory.createQuery(keyword, algorithm);
            let result: QueryResponse;
        
            switch (algorithm) {
                case AlgorithmEnum.Boolean:
                    // Action for Boolean algorithm
                    console.log("Performing action for Boolean algorithm");
                    let booleanQuery = queryFactory.createQuery(keyword, AlgorithmEnum.Boolean) as BooleanQuery;
                    let booleanBackend = backendFactory.getBackend(AlgorithmEnum.Boolean);
                    if (booleanBackend) {
                        result = booleanBackend.handle(booleanQuery);
                    }

                    break;

                case AlgorithmEnum.Vector:
                    // Action for Vector algorithm
                    console.log("Performing action for Vector algorithm");
                    break;
                case AlgorithmEnum.LanguageModel:
                    // Action for LanguageModel algorithm
                    console.log("Performing action for LanguageModel algorithm");
                    break;
                default:
                    // Default action if the algorithm is not recognized
                    console.log("Unknown algorithm");
            }
      
    });
  }

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
            .output-container p {
              margin: 0;
              padding: 8px;
              border-bottom: 1px solid #eee;
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
              <div>Search Engines</div>
              <div>Input: </div>
              <input type="text" class="txt-box" id="searchmastervalueid" name="searchmastervaluename"><br>
              <label for="searchType">Choose a search type:</label>
                <select id="searchType" class="search-select" name="searchTypeSelect">
                    <option value="boolean">Boolean</option>
                    <option value="language">Language</option>
                    <option value="vector">Vector</option>
                </select>
                <button type="button" class="btn-search">Search !</button><br>

              <div id="output" class="output-container"> </div>
          </div>
              <script nonce="${nonce}" src="${scriptUri}"></script>
           </body>
        </html>`;
  }
}
