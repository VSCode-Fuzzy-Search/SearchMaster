(function () {
    const vscode = acquireVsCodeApi();

    const searchBtn = document.querySelector('.btn-search');
    const txtbox = document.querySelector('.txt-box');
    const searchType = document.querySelector('.search-select');
    const editDistance = document.getElementById('searchmastereditdistanceid');
    const searchDesc = document.getElementById('searchDescription');

    searchBtn.addEventListener('click', () => {
        vscode.postMessage([
            { type: 'btn-search', value: txtbox.value },
            { type: 'search-select', value: 'fuzzy' },
            { type: 'edit-distance', value: editDistance.value }
        ]);
    });

    window.addEventListener('message', event => {
        const message = event.data;

        if (message.type === 'searchDescription') {
            searchDesc.innerText = message.description;
        }

        if (message.type === 'searchResults') {
            const outputContainer = document.getElementById('output');
            outputContainer.innerHTML = "<p class='border-b border-gray-200 pb-2'>Query Results:</p>";

            // Object to store result containers by document ID and distance
            const resultsByFileAndDistance = {};

            // Group results by document and distance
            message.results.forEach(queryResult => {
                const { documentID, distance } = queryResult;

                if (!resultsByFileAndDistance[documentID]) {
                    resultsByFileAndDistance[documentID] = {};
                }

                if (!resultsByFileAndDistance[documentID][distance]) {
                    resultsByFileAndDistance[documentID][distance] = [];
                }

                // Add the match to the group for the specific file and distance
                resultsByFileAndDistance[documentID][distance].push(queryResult);
            });

            // Loop through each file and its associated distances
            Object.keys(resultsByFileAndDistance).forEach(documentID => {
                // Sort distances in ascending order
                const distances = Object.keys(resultsByFileAndDistance[documentID]).sort((a, b) => a - b);

                // Create the main file container
                const fileContainer = document.createElement('div');
                fileContainer.classList.add('file-container');

                // File icon and filename
                const fileDetails = document.createElement('div');
                fileDetails.classList.add('file-details');
                
                const fileIcon = document.createElement('span');
                fileIcon.classList.add('file-icon');

                const fileImage = document.createElement('img');
                const fileExtension = documentID.split('.').pop();

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

                fileImage.classList.add('file-icon-img');
                fileIcon.appendChild(fileImage);

                const filename = document.createElement('span');
                filename.textContent = documentID;
                filename.classList.add('filename');

                fileDetails.appendChild(fileIcon);
                fileDetails.appendChild(filename);

                // Add file details to the main file container
                fileContainer.appendChild(fileDetails);

                // Create a container to hold all the subcontainers for different distances
                const allMatchesContainer = document.createElement('div');
                allMatchesContainer.classList.add('all-matches-container');

                // Create a separate subcontainer for each distance
                distances.forEach(distance => {
                    const matchesForDistance = resultsByFileAndDistance[documentID][distance];

                    // Create a subcontainer for each distance
                    const distanceContainer = document.createElement('div');
                    distanceContainer.classList.add('distance-container');

                    // Add a label for the distance
                    const distanceLabel = document.createElement('p');
                    distanceLabel.textContent = `Edit Distance: ${distance}`;
                    distanceLabel.classList.add('distance-label');
                    distanceContainer.appendChild(distanceLabel);

                    // Create a matches container to hold the individual matches for this distance
                    const matchesContainer = document.createElement('div');
                    matchesContainer.classList.add('matches-container');

                    // Add the matches to the matches container
                    matchesForDistance.forEach(queryResult => {
                        const codeSnippet = document.createElement('p');
                        codeSnippet.classList.add('code-snippet');
                        
                        // Add data attributes to store file path, position, and word
                        codeSnippet.dataset.filePath = documentID;
                        codeSnippet.dataset.position = JSON.stringify(queryResult.position);
                        codeSnippet.dataset.word = queryResult.word;
                        codeSnippet.dataset.fullPath = queryResult.filePath;
                        codeSnippet.dataset.line = queryResult.position.line;

                        codeSnippet.innerHTML = `<span class="line-number">${queryResult.position.line}</span> ${queryResult.word}`;
                        matchesContainer.appendChild(codeSnippet);
                    });

                    // Append matches container to the distance container
                    distanceContainer.appendChild(matchesContainer);

                    // Append the distance container to the all matches container
                    allMatchesContainer.appendChild(distanceContainer);
                });

                // Append the all matches container to the main file container
                fileContainer.appendChild(allMatchesContainer);

                // Append the main file container to the output
                outputContainer.appendChild(fileContainer);

                // Handle showing only the first 15 matches across all distances and adding Show More/Show Less
                const allMatches = Array.from(allMatchesContainer.querySelectorAll('.code-snippet'));
                const maxToShow = 15;

                if (allMatches.length > maxToShow) {
                    // Hide the extra matches (beyond the first 15)
                    allMatches.slice(maxToShow).forEach(match => {
                        match.style.display = 'none';
                    });

                    // Create the "Show More" button
                    const showMoreButton = document.createElement('button');
                    showMoreButton.classList.add('show-more-button');
                    showMoreButton.textContent = "Show More";
                    
                    // Create the "Show Less" button
                    const showLessButton = document.createElement('button');
                    showLessButton.classList.add('show-less-button');
                    showLessButton.textContent = "Show Less";
                    showLessButton.style.display = 'none';  // Initially hidden

                    // Show More button functionality
                    showMoreButton.addEventListener('click', () => {
                        // Show all hidden matches
                        allMatches.slice(maxToShow).forEach(match => {
                            match.style.display = 'block';
                        });

                        // Hide the "Show More" button and display the "Show Less" button
                        showMoreButton.style.display = 'none';
                        showLessButton.style.display = 'block';
                    });

                    // Show Less button functionality
                    showLessButton.addEventListener('click', () => {
                        // Hide the extra matches again
                        allMatches.slice(maxToShow).forEach(match => {
                            match.style.display = 'none';
                        });

                        // Hide the "Show Less" button and display the "Show More" button
                        showLessButton.style.display = 'none';
                        showMoreButton.style.display = 'block';
                    });

                    // Append both buttons after the all matches container
                    allMatchesContainer.appendChild(showMoreButton);
                    allMatchesContainer.appendChild(showLessButton);
                }
            });

            // After generating the search results, attach click event listeners
            attachEventListeners();
        }

        if (message.type === "errorScreen") {
            const outputContainer = document.getElementById('output');
            outputContainer.innerHTML = "<p class='border-b border-gray-200 pb-2'>Query length too short for given edit distance.</p>";
        }
    });

    function handleClick(event) {
        // Find the specific .code-snippet element that was clicked
        const target = event.target.closest('.code-snippet');

        if (target) {
            const filePath = target.dataset.filePath;
            const position = target.dataset.position;
            const word = target.dataset.word;
            const fullPath = target.dataset.fullPath;
            const line = target.dataset.line;

            // Post the message with the correct data
            vscode.postMessage({
                command: 'openFile',
                filePath: filePath,
                position: JSON.parse(position),  // Parse the position back to an object
                word: word,
                fullPath: fullPath,
                line: parseInt(line, 10),  // Parse the line to an integer
            });
        } else {
            console.error("No target found for the click event.");
        }
    }

    // Attach the event listeners to each .code-snippet element
    function attachEventListeners() {
        document.querySelectorAll('.code-snippet').forEach(item => {
            item.addEventListener('click', handleClick);
        });
    }
}());
