import {
  CancellationToken,
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
import path = require("path");

/**
 * Registers webview panel in VSCode extension side bar
 * @param context current session context
 * @param op output channel for current session
 */
export function registerWebViewProvider(
  context: ExtensionContext,
  op: OutputChannel
) {
  const provider = new SidebarWebViewProvider(context.extensionUri, context);
  context.subscriptions.push(
    window.registerWebviewViewProvider("search-master-sidebar-panel", provider)
  );
}

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

    // Function to update the webview witht the latest values from the workspaceState
    const updateWebViewState = () => {
      const savedSearchTerm = this.extensionContext.workspaceState.get<string>(
        "searchTerm",
        ""
      );
      const savedEditDistance =
        this.extensionContext.workspaceState.get<string>("editDistance", "0");

      webviewView.webview.html = this._getHtmlForWebview(
        webviewView.webview,
        savedSearchTerm,
        savedEditDistance
      );
    };

    // Initial load of workspaceState values
    updateWebViewState();

    // Listen for visibility changes
    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        updateWebViewState();
      }
    });

    webviewView.webview.onDidReceiveMessage(async (data) => {
      /**
       * Switch case for posted commands
       * Valid commands are: [search, openFile]
       */
      console.log(data);
      switch (data.command) {
        case "search": {
          /**
           * Switch case for searchType
           * Currently only for fuzzy search but kept for extensibility
           */
          if (vscode.workspace.workspaceFolders !== undefined) {
            try {
              const path =
                vscode.workspace.workspaceFolders[0].uri.path.substring(1);
              const backendFactory = BackendFactory.getInstance(); // Backend factory is a singleton instance
              backendFactory.createAllBackends(path, this.extensionContext);
            } catch (error) {
              vscode.window.showErrorMessage(
                "Error creating Backend Factory: " + error
              );
            }
          } else {
            vscode.window.showInformationMessage(
              "Could not find workspace, relaunch and try again"
            );
          }

          switch (data.searchType) {
            case "fuzzy": {
              console.log("Fuzzy searchType");
              // Checking edit distance is less than half the word length
              // This is done for search efficiency and accuracy
              if (data.searchTerm.length / 2 > parseInt(data.editDistance)) {
                let fuzzyQuery = QueryFactory.getInstance().createQuery(
                  // case handling

                  data.searchTerm.toLocaleLowerCase() + "/" + data.editDistance,
                  AlgorithmEnum.Fuzzy
                );
                let fuzzyBackend = BackendFactory.getInstance().getBackend(
                  AlgorithmEnum.Fuzzy
                );
                if (fuzzyQuery !== null) {
                  const result = fuzzyQuery && fuzzyBackend?.handle(fuzzyQuery);
                  console.log("Results collected and being posted");
                  if (result && webviewView.webview) {
                    webviewView.webview.postMessage({
                      type: "searchResults",
                      results: result.results,
                    });
                  }
                }
                break;
              } else {
                // Window message for edit distance too short
                webviewView.webview.postMessage({
                  type: "errorScreen",
                  results: "Search Query too Short for given Edit Distance",
                });
                break;
              }
            }
            // Add in extra search algorithms here
            default: {
              vscode.window.showErrorMessage("Search type not found");
              break;
            }
          }
          break;
        }
        case "openFile": {
          try {
            const fullPath = data.fullPath;
            const document = await vscode.workspace.openTextDocument(fullPath);
            const editor = await vscode.window.showTextDocument(document);

            // Use the line number from the data to reveal the line
            if (data.line !== undefined && data.word) {
              const lineNumber = Number(data.line);
              const lineText = document
                .lineAt(lineNumber - 1) // -1 because lines are 0-based in the editor
                .text.toLowerCase(); // case handling

              // Find the index of the word in the line
              const wordIndex = lineText.indexOf(data.word);

              if (wordIndex !== -1) {
                // Highlight the word by setting the start and end positions
                const startPos = new vscode.Position(lineNumber - 1, wordIndex); // Line number needs to be zero-based
                const endPos = new vscode.Position(
                  lineNumber - 1,
                  wordIndex + data.word.length
                );
                // Find the entire word to highlight
                const range = new vscode.Range(startPos, endPos);

                // Set the selection to the word and reveal the range
                editor.selection = new vscode.Selection(startPos, endPos);
                editor.revealRange(range, vscode.TextEditorRevealType.InCenter); // Reveal the word in the center of the editor
              } else {
                // File will still open to beginning of file
                vscode.window.showInformationMessage(
                  `Word "${data.word}" not found on line ${lineNumber}`
                );
              }
            } else {
              vscode.window.showErrorMessage(
                "Line number or word not provided"
              );
              break;
            }
          } catch (error) {
            vscode.window.showErrorMessage(`Error opening document: ${error}`);
          }
          break;
        }
        default: {
          vscode.window.showErrorMessage("Invalid command");
          break;
        }
      }
    });
  }

  private _getHtmlForWebview(
    webview: Webview,
    savedSearchTerm: string,
    savedEditDistance: string
  ) {
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
    const helpIconUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "media",
        "icons",
        "help-icon.png"
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
                    flex: 70%;
                    /* Ensure the input takes 70% of the container */
                }

                .search-select {
                    flex: 30%;
                    /* Ensure the select takes 30% of the container */
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

                .show-more-button,
                .show-less-button {
                    background-color: #007acc;
                    color: #ffffff;
                    border: none;
                    padding: 5px 10px;
                    margin-top: 10px;
                    cursor: pointer;
                    border-radius: 4px;
                    font-size: 12px;
                }

                .show-more-button:hover,
                .show-less-button:hover {
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

                .code-snippet:hover {
                    text-decoration: underline;
                    cursor: pointer;
                }

                .file-details {
                    display: flex;
                    align-items: center;
                    margin-bottom: 5px;
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
                .hover-container {
                    position: relative;
                    display: inline-block;
                }

                .hover-icon {
                    max-width: 24px;
                    height: 24px; 
                    cursor: pointer;
                }

                .hover-text {
                    position: absolute;
                    right: 100%;
                    top: 100%;
                    transform: translateY(5px);
                    background-color: #333;
                    color: #fff;
                    padding: 5px 10px;
                    border-radius: 5px;
                    font-size: 14px;
                    white-space: normal; 
                    max-width: 300px;
                    width: 200px;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    z-index: 1000;
                    pointer-events: none;
                }

                .hover-container:hover .hover-text {
                    opacity: 1;
                    pointer-events: auto;
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
                  value="${
                    savedSearchTerm !== undefined
                      ? savedSearchTerm
                      : "default search term"
                  }"
                  name="searchmastervaluename" 
                  placeholder="Enter search term..." 
                  style="flex: 70%;" >

                <select
                  id="searchmastereditdistanceid"
                  class="search-select h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline"
                  name="searchEditDistanceSelect"
                  style="flex: 30%; color: black;" >
                  <option value="0" ${
                    savedEditDistance === "0"
                      ? "selected"
                      : savedEditDistance === undefined
                      ? "selected"
                      : ""
                  }>0</option>
                  <option value="1" ${
                    savedEditDistance === "1" ? "selected" : ""
                  }>1</option>
                  <option value="2" ${
                    savedEditDistance === "2" ? "selected" : ""
                  }>2</option>
                  <option value="3" ${
                    savedEditDistance === "3" ? "selected" : ""
                  }>3</option>
                  <option value="4" ${
                    savedEditDistance === "4" ? "selected" : ""
                  }>4</option>
                  <option value="5" ${
                    savedEditDistance === "5" ? "selected" : ""
                  }>5</option>
                </select>
                <div class="hover-container">
                    <img src="${helpIconUri}" class="hover-icon">
                    <span class="hover-text">
                      Adjust the edit distance<br>
                      using the dropdown menu.<br>
                      Set to 0 for exact matches.<br>
                      Increase for fuzzier matches.
                </div>
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
