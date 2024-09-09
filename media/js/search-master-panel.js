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

                const fileImage = document.createElement('img');
                const fileExtension = queryResult.documentID.split('.').pop();

                switch (fileExtension) {
                    case 'ts':
                      fileImage.src = tsLogoPath;
                      fileImage.alt = 'TypeScript Logo';
                      break;
                    case 'js':
                      fileImage.src = jsLogoPath;
                      fileImage.alt = 'JavaScript Logo';
                      break;
                    case 'py':
                      fileImage.src = pyLogoPath;
                      fileImage.alt = 'Python Logo';
                      break;
                    case 'html':
                      fileImage.src = htmlLogoPath;
                      fileImage.alt = 'HTML Logo';
                      break;
                    case 'css':
                      fileImage.src = cssLogoPath;
                      fileImage.alt = 'CSS Logo';
                      break;
                    case 'json':
                      fileImage.src = jsonLogoPath;
                      fileImage.alt = 'JSON Logo';
                      break;
                    default:
                      fileImage.src = defaultLogoPath;
                      fileImage.alt = 'Default Logo';
                      break;
                  }
                  
                fileImage.classList.add('file-icon-img'); // Optional CSS class
        
                fileIcon.appendChild(fileImage);
        
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
