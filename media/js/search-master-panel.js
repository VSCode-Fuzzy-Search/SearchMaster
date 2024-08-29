(function () {
    const vscode = acquireVsCodeApi();
    
    const searchBtn = document.querySelector('.btn-search');
    const txtbox = document.querySelector('.txt-box');
    const searchType = document.querySelector('.search-select');
    const editDistance = document.getElementById('searchmastereditdistanceid');
    const searchDesc = document.getElementById('searchDescription');

    searchBtn.addEventListener('click', () => {
        vscode.postMessage([{ type: 'btn-search', value: txtbox.value }, { type: 'search-select', value: searchType.value }, {type: 'edit-distance', value: editDistance.value}]);
        //vscode.postMessage({ type: 'search-select', value: searchType.value });
    });

    searchType.addEventListener('change', () => {
        console.log("Search type has changed");
        vscode.postMessage({ type: 'search-change', value : searchType.value });
    });

    window.addEventListener('message', event => {
        const message = event.data;

        if (message.type === 'searchDescription'){
            searchDesc.innerText = message.description;
        }
    
        if (message.type === 'searchResults') {
            const outputContainer = document.getElementById('output');
            outputContainer.innerHTML = "<p class='border-b border-gray-200 pb-2'>Query Results:</p>";
    
            message.results.forEach(queryResult => {
                const listItem = document.createElement('p');
                listItem.textContent = queryResult.documentID;
                outputContainer.appendChild(listItem);
            });
        }
    });

    document.getElementById('searchResults').addEventListener('click', function(event) {
        // Assuming you have a data attribute or some other way to identify the file
        const filePath = "src/extension/views/register-webview-provider.ts";
        if (filePath) {
            vscode.postMessage({
                command: 'openFile',
                filePath: filePath
            });
        }
    });
    
}());
