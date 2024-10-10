# Search Master for Visual Studio Code

Welcome the the Search Master for Visual Studio Code repository.
Here you will find the source code and installation instructions to use the extension in VS Code.
You will also find instructions on how to use the extension

## Contents
- [1 - Installing the extension](#installing-the-extension)
- [2 - Using the extension](#using-the-extension)
	- [Searching - Exact Matches](#searching---exact-matches)
	- [Searching - Fuzzy Matches](#searching---fuzzy-matches)
	- [Results](#results)


## 1 - Installing the Extension
<!-- The link below should be updated if the extension file name changes -->
1. Firstly, download the extension by clicking [here](./search-master-0.0.1.vsix) and downloading the file.

![alt text](./readme_assets/image.png)

2. Open VS Code and navigate to the extensions panel.

![alt text](./readme_assets/image2.png)

3. click on the ellipses for more actions, and select __Install from VSIX...__

![alt text](./readme_assets/image3.png)

4. Navigate to and select the file that was downloaded in Step 1. 

## 2 - Using the Extension

### Searching - Exact Matches
To search for exact matches, simply type the search term in the text box, and hit search

### Searching - Fuzzy Matches
Searching for fuzzy or inexact matches can also be done by adjusting the edit distance of the search. 
This can be done by clicking the number next the text box, and adjusting it. The greater the number, the larger the edit distance and thus the degree of allowed fuzzy matches. 

Edit distance is a measure of how many changes (insertions, deletions, or substitutions) are needed to transform one string into another. For instance, the edit distance between the strings "hello" "jello" is 1, where they only differ by the substitution of the letter "j" or "h"

### Results
Results in a file are ranked in order of increasing edit distance to make finding the closer matches easier. 
When clicking on a result, the file window will open the document to the location of the match and highlight it. 



