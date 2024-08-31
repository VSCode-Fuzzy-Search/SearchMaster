(function () {
    const vscode = acquireVsCodeApi();

    const searchBtn = document.querySelector('.btn-search');
    const txtbox = document.querySelector('.txt-box');
    const searchType = document.querySelector('.search-select');
    const editDistance = document.getElementById('searchmastereditdistanceid');
    const searchDesc = document.getElementById('searchDescription');

    searchBtn.addEventListener('click', () => {
        vscode.postMessage([{ type: 'btn-search', value: txtbox.value }, { type: 'search-select', value: searchType.value }, { type: 'edit-distance', value: editDistance.value }]);
    });

    searchType.addEventListener('change', () => {
        console.log("Search type has changed");
        vscode.postMessage({ type: 'search-change', value: searchType.value });
    });

    window.addEventListener('message', event => {
        const message = event.data;

        if (message.type === 'searchDescription') {
            searchDesc.innerText = message.description;
        }

        if (message.type === 'searchResults') {
            const outputContainer = document.getElementById('output');
            outputContainer.innerHTML = "<p class='border-b border-gray-200 pb-2'>Query Results:</p>";

            message.results.forEach(queryResult => {
                const listItem = document.createElement('p');
                listItem.textContent = queryResult.documentID;
                listItem.classList.add('query-result');
                listItem.dataset.filePath = queryResult.filePath; 
                listItem.dataset.position = queryResult.position; 
                listItem.dataset.word = queryResult.word; 

                outputContainer.appendChild(listItem);
            });

            // Attach event listeners to each result
            document.querySelectorAll('.query-result').forEach(item => {
                item.addEventListener('click', handleClick);
            });
        }
    });

    function handleClick(event) {
        const filePath = event.target.dataset.filePath;
        const position = event.target.dataset.position;
        const word = event.target.dataset.word;

        vscode.postMessage({
            command: 'openFile',
            filePath: filePath,
            position: position,
            word: word
        });
    }
}());
