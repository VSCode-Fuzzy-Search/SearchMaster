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
                const resultContainer = document.createElement('div');
                resultContainer.classList.add('result-container');
        
                // File icon and filename
                const fileDetails = document.createElement('div');
                fileDetails.classList.add('file-details');
                
                const fileIcon = document.createElement('span');
                fileIcon.classList.add('file-icon');
                fileIcon.textContent = 'JS'; // Replace with an icon or change based on file type
                
                const filename = document.createElement('span');
                filename.textContent = queryResult.documentID;
                filename.classList.add('filename');
        
                fileDetails.appendChild(fileIcon);
                fileDetails.appendChild(filename);
        
                // Position and word
                const codeSnippet = document.createElement('p');
                codeSnippet.classList.add('code-snippet');
                codeSnippet.innerHTML = `<span class="line-number">${queryResult.position}</span> ${queryResult.word}`;
        
                resultContainer.appendChild(fileDetails);
                resultContainer.appendChild(codeSnippet);
        
                // Attach file path, position, word data for event handling
                resultContainer.dataset.filePath = queryResult.filePath; 
                resultContainer.dataset.position = queryResult.position; 
                resultContainer.dataset.word = queryResult.word; 
        
                outputContainer.appendChild(resultContainer);
            });
        
            // Attach event listeners to each result
            document.querySelectorAll('.result-container').forEach(item => {
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
