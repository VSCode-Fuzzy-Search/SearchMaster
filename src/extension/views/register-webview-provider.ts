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
      let searchTerm = data[0].value;
      let searchType = data[1].value;
      // if (data.type === "btn-search") {
      //   searchTerm = data.value;
      // }
      // if (data.type === "search-select") {
      //   searchType = data.value;
      // }
      // this.extensionContext.secrets.store("searchmasterCacheKey", data.value);
      // const searchType: string = await this.extensionContext.secrets.get("searchType") ?? "";

      if(vscode.workspace.workspaceFolders !== undefined) {

        let path = vscode.workspace.workspaceFolders[0].uri.path.substring(1);
      
        const backendFactory = new BackendFactory();
        backendFactory.createAllBackends(
          path
        );
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
              const result = booleanQuery && booleanBackend?.handle(booleanQuery);
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

            default:
              vscode.window.showInformationMessage("Search type not found");
              break;

      }
    }});
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
              <input type="text" class="txt-box" id="searchmastervalueid" name="searchmastervaluename" placeholder="Enter search term..."><br>
              <label for="searchType">Choose a search type:</label>
                <select id="searchType" class="search-select" name="searchTypeSelect">
                    <option value="boolean">Boolean</option>
                    <option value="language">Language</option>
                    <option value="vector">Vector</option>
                </select>
                <button type="button" class="btn-search">Search !</button><br>

              <div id="output" class="output-container"> Where the fuck is this</div>
          </div>
              <script nonce="${nonce}" src="${scriptUri}"></script>
           </body>
        </html>`;
  }
}
