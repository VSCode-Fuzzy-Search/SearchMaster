(function () {
    const vscode = acquireVsCodeApi();

    const searchBtn = document.querySelector('.btn-search');
    const txtbox = document.querySelector('.txt-box');
    const searchType = document.querySelector('.search-select');
    const editDistance = document.getElementById('searchmastereditdistanceid');
    const searchDesc = document.getElementById('searchDescription');

    searchBtn.addEventListener('click', () => {
        vscode.postMessage([{ type: 'btn-search', value: txtbox.value }, { type: 'search-select', value: 'fuzzy' }, { type: 'edit-distance', value: editDistance.value }]);
    });

    // searchType.addEventListener('change', () => {
    //     console.log("Search type has changed");
    //     vscode.postMessage({ type: 'search-change', value: searchType.value });
    // });

    window.addEventListener('message', event => {
        const message = event.data;

        if (message.type === 'searchDescription') {
            searchDesc.innerText = message.description;
        }

        if (message.type === 'searchResults') {
          const outputContainer = document.getElementById('output');
          outputContainer.innerHTML = "<p class='border-b border-gray-200 pb-2'>Query Results:</p>";
      
          // Object to store result containers by document ID (filename)
          const fileContainers = {};
      
          message.results.forEach(queryResult => {
              // Check if we already have a container for this file
              let resultContainer = fileContainers[queryResult.documentID];
      
              if (!resultContainer) {
                  // Create a new result container if it doesn't exist for the file
                  resultContainer = document.createElement('div');
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
      
                  // Add file details to the result container
                  resultContainer.appendChild(fileDetails);
      
                  // Create and append the matches container
                  const matchesContainer = document.createElement('div');
                  matchesContainer.classList.add('matches-container');
                  resultContainer.appendChild(matchesContainer);
      
                  // Store the container by file name
                  fileContainers[queryResult.documentID] = resultContainer;
      
                  // Append the result container to the output
                  outputContainer.appendChild(resultContainer);
              }
      
              // Add the matches to the matches container for this file
              const matchesContainer = resultContainer.querySelector('.matches-container');
              const codeSnippet = document.createElement('p');
              codeSnippet.classList.add('code-snippet');
              codeSnippet.innerHTML = `<span class="line-number">${queryResult.position}</span> ${queryResult.word}`;
      
              matchesContainer.appendChild(codeSnippet);
          });
      
          // Now handle showing the first 15 matches and adding "Show More" and "Show Less" buttons
          Object.values(fileContainers).forEach(container => {
              const matchesContainer = container.querySelector('.matches-container');
              const allMatches = Array.from(matchesContainer.children);
              const maxToShow = 15;
      
              // If there are more than 15 matches, hide the excess and add a "Show More" button
              if (allMatches.length > maxToShow) {
                  // Hide the extra matches
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
      
                  // Append both buttons after the matches container
                  container.appendChild(showMoreButton);
                  container.appendChild(showLessButton);
              }
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
