(function () {
  const vscode = acquireVsCodeApi();

  const searchBtn = document.querySelector(".btn-search");
  const inputBox = document.querySelector(".txt-box");
  const editDistance = document.getElementById("searchmastereditdistanceid");
  const searchDesc = document.getElementById("searchDescription");

  searchBtn.addEventListener("click", () => {
    const data = {
      command: "search",
      searchTerm: inputBox.value,
      searchType: "fuzzy",
      editDistance: editDistance.value,
    };
    if (data.searchTerm.length / 2 < parseInt(data.editDistance)) {
      vscode.postMessage({
        command: "inputError",
        errorType: "length",
      });
    } else if (data.searchTerm.includes(" ")) {
      vscode.postMessage({
        command: "inputError",
        errorType: "space",
      });
    } else if (!data.searchTerm.match(/^[a-zA-Z0-9]+$/)) {
      vscode.postMessage({
        command: "inputError",
        errorType: "nonalphanumeric",
      });
    } else {
      vscode.postMessage(data);
    }
  });

  window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.type) {
      case "searchResults": {
        const outputContainer = document.getElementById("output");
        outputContainer.innerHTML = "<p class='border-b border-gray-200 pb-2'>Query Results:</p>";

        const resultsByFileAndDistance = {};
        message.results.forEach((queryResult) => {
          const { documentID, distance } = queryResult;
          if (!resultsByFileAndDistance[documentID]) {
            resultsByFileAndDistance[documentID] = {};
          }
          if (!resultsByFileAndDistance[documentID][distance]) {
            resultsByFileAndDistance[documentID][distance] = [];
          }
          resultsByFileAndDistance[documentID][distance].push(queryResult);
        });

        Object.keys(resultsByFileAndDistance).forEach((documentID) => {
          const distances = Object.keys(resultsByFileAndDistance[documentID]).sort((a, b) => a - b);
          const fileContainer = document.createElement("div");
          fileContainer.classList.add("file-container");

          const fileDetails = document.createElement("div");
          fileDetails.classList.add("file-details");

          const fileIcon = document.createElement("span");
          fileIcon.classList.add("file-icon");

          const fileImage = document.createElement("img");
          const fileExtension = documentID.split(".").pop();
          switch (fileExtension) {
            case "ts":
              fileImage.src = tsLogoPath;
              fileImage.alt = "TypeScript Logo";
              break;
            case "js":
              fileImage.src = jsLogoPath;
              fileImage.alt = "JavaScript Logo";
              break;
            case "py":
              fileImage.src = pyLogoPath;
              fileImage.alt = "Python Logo";
              break;
            case "html":
              fileImage.src = htmlLogoPath;
              fileImage.alt = "HTML Logo";
              break;
            case "css":
              fileImage.src = cssLogoPath;
              fileImage.alt = "CSS Logo";
              break;
            case "json":
              fileImage.src = jsonLogoPath;
              fileImage.alt = "JSON Logo";
              break;
            default:
              fileImage.src = defaultLogoPath;
              fileImage.alt = "Default Logo";
              break;
          }

          fileImage.classList.add("file-icon-img");
          fileIcon.appendChild(fileImage);

          const filename = document.createElement("span");
          filename.textContent = documentID;
          filename.classList.add("filename");
          filename.dataset.fullPath = resultsByFileAndDistance[documentID][distances[0]][0].filePath;

          fileDetails.appendChild(fileIcon);
          fileDetails.appendChild(filename);
          fileContainer.appendChild(fileDetails);

          const allMatchesContainer = document.createElement("div");
          allMatchesContainer.classList.add("all-matches-container");

          distances.forEach((distance) => {
            const matchesForDistance = resultsByFileAndDistance[documentID][distance];
            const distanceContainer = document.createElement("div");
            distanceContainer.classList.add("distance-container");

            const distanceLabel = document.createElement("p");
            distanceLabel.textContent = `Edit Distance: ${distance}`;
            distanceLabel.classList.add("distance-label");
            distanceContainer.appendChild(distanceLabel);

            const matchesContainer = document.createElement("div");
            matchesContainer.classList.add("matches-container");

            matchesForDistance.forEach((queryResult) => {
              const codeSnippet = document.createElement("p");
              codeSnippet.classList.add("code-snippet");

              codeSnippet.dataset.filePath = documentID;
              codeSnippet.dataset.position = JSON.stringify(queryResult.position);
              codeSnippet.dataset.word = queryResult.word;
              codeSnippet.dataset.fullPath = queryResult.filePath;
              codeSnippet.dataset.line = queryResult.position.line;

              codeSnippet.innerHTML = `<span class="line-number">${queryResult.position.line}</span> ${queryResult.word}`;
              matchesContainer.appendChild(codeSnippet);
            });

            distanceContainer.appendChild(matchesContainer);
            allMatchesContainer.appendChild(distanceContainer);
          });

          fileContainer.appendChild(allMatchesContainer);
          outputContainer.appendChild(fileContainer);
        });

        attachEventListeners();
        break;
      }
      case "errorScreen": {
        const outputContainer = document.getElementById("output");
        outputContainer.innerHTML = `<p class='border-b border-gray-200 pb-2'>${message.results}</p>`;
      }
    }
  });

  function handleClick(event) {
    const target = event.target.closest(".code-snippet");
    if (target) {
      const filePath = target.dataset.filePath;
      const position = target.dataset.position;
      const word = target.dataset.word;
      const fullPath = target.dataset.fullPath;
      const line = target.dataset.line;

      vscode.postMessage({
        command: "openFile",
        filePath: filePath,
        position: JSON.parse(position),
        word: word,
        fullPath: fullPath,
        line: parseInt(line, 10),
      });
    }
  }

  function showTooltip(event) {
    const target = event.target;
    const fullPath = target.dataset.fullPath;

    // Create tooltip element
    const tooltip = document.createElement("div");
    tooltip.classList.add("custom-tooltip");
    tooltip.textContent = fullPath;

    document.body.appendChild(tooltip);

    tooltip.style.left = `${event.pageX + 10}px`;
    tooltip.style.top = `${event.pageY - 10}px`;

    target.addEventListener("mouseleave", () => {
      tooltip.remove();
    });
  }

  function attachEventListeners() {
    document.querySelectorAll(".code-snippet").forEach((item) => {
      item.addEventListener("click", handleClick);
    });

    document.querySelectorAll(".filename").forEach((item) => {
      item.addEventListener("mouseenter", showTooltip);
    });
  }
})();
