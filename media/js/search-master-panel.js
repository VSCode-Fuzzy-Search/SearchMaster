(function () {
    const vscode = acquireVsCodeApi();
    
    const searchBtn = document.querySelector('.btn-search');
    const txtbox = document.querySelector('.txt-box');
    const searchType = document.querySelector('.search-select');

    searchBtn.addEventListener('click', () => {
        vscode.postMessage([{ type: 'btn-search', value: txtbox.value }, { type: 'search-select', value: searchType.value }]);
        //vscode.postMessage({ type: 'search-select', value: searchType.value });
    });

    window.addEventListener('message', event => {
        const message = event.data;
    
        if (message.type === 'searchResults') {
            const outputContainer = document.getElementById('output');
            outputContainer.innerHTML = "<p class='output-title'>Query Results:</p>";
    
            message.results.forEach(queryResult => {
                const listItem = document.createElement('p');
                listItem.textContent = queryResult.documentID;
                outputContainer.appendChild(listItem);
            });
        }
    });
    
}());
