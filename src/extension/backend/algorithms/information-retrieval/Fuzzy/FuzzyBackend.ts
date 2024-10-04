
import Document from "../../../Document";
import QueryBackend from "../QueryBackend";
import QueryResponse from "../../../results/QueryResponse";
import Query from "../../../queries/Query";
import Node from "./Node";
import FuzzyQuery from "../../../queries/FuzzyQuery";
import { ExtensionContext } from "vscode";

export default class FuzzyBackend extends QueryBackend {
    
    /**
     * Creates the index used to handle queries
     * @param documents list of documents used to create the index
     */
    protected generateIndex(documents: Document[], extensionContext: ExtensionContext): void {
        // Try to retrieve existing index
        const existingIndex = extensionContext.workspaceState.get<{ [documentName: string]: Node }>("index");
        
        // Use existing index or create new one if it doesn't exist
        if (existingIndex) {
            this.index = existingIndex;
            console.log("using existing index");
        } else {
            console.log("creating index");

            const index: { [documentName: string]: Node } = {};
            for (let i = 0; i < documents.length; i++) {
                let words = documents[i].contents.replace(/[^a-z0-9]/gi, ' ').split(" ");
                index[documents[i].filename] = this.createTrie(words, documents[i].contents, documents[i].filePath);  // Pass the document contents
            }
            extensionContext.workspaceState.update("index", index);
            this.index = index;
            
            console.log("created new index");
        }            
    }

    // private createTrie(words: string[], document: string, filePath: string): Node {
    //     const root = new Node("", "", filePath);  // Initialize the root of the trie with filePath
    //     let currentPosition = 0;
    
    //     for (const word of words) {
    //         let current = root;
    //         const wordPosition = document.indexOf(word, currentPosition);  // Find the position of the word in the document
    
    //         for (let j = 0; j < word.length; j++) {
    //             const letter = word[j];
    //             // Add the letter to the trie if it doesn't exist
    //             if (!(letter in current.children)) {
    //                 const node = new Node(letter, word.substring(0, j + 1), filePath);  // Store filePath in each node
    //                 current.children[letter] = node;
    //             }
    //             current = current.children[letter];
    //             // Add the position of the substring within the entire document
    //             if (j === word.length - 1) {
    //                 current.positions.push(wordPosition);
    //             }
    //         }
    //         current.endOfPattern = true; // Mark the end of a pattern
    
    //         currentPosition = wordPosition + word.length;  // Update currentPosition to continue the search
    //     }
    
    //     return root;
    // }

    private createTrie(words: string[], document: string, filePath: string): Node {
        const root = new Node("", "", filePath);  // Initialize the root of the trie with filePath
        let currentPosition = 0;
    
        // Split the document into lines to track line positions
        const lines = document.split("\n");
        let lineIndex = 1;
        let lineOffset = 0;  // Character offset for the current line
    
        for (const line of lines) {
            let wordsInLine = line.replace(/[^a-z0-9]/gi, ' ').split(" ");  // Split line into words
    
            for (const word of wordsInLine) {
                let current = root;
    
                // Calculate word position based on the character offset in the current line
                const wordPosition = line.indexOf(word, currentPosition);  // Character position in the line
    
                // Store the word's line and word index, relative to the entire document
                const wordIndexInLine = wordsInLine.indexOf(word);  // Get the word index within the line
    
                // Iterate through each letter of the word to build the trie
                for (let j = 0; j < word.length; j++) {
                    const letter = word[j];
    
                    // Add the letter to the trie if it doesn't exist
                    if (!(letter in current.children)) {
                        const node = new Node(letter, word.substring(0, j + 1), filePath);  // Store filePath in each node
                        current.children[letter] = node;
                    }
                    current = current.children[letter];
    
                    // When we reach the end of the word, store the position info
                    if (j === word.length - 1) {
                        current.positions.push({
                            wordPosition: wordPosition + lineOffset,  // Character position within the line
                            line: lineIndex,  // Line number
                            wordIndex: wordIndexInLine  // Word index within the line
                        } as any);
                    }
                }
    
                current.endOfPattern = true;  // Mark the end of a pattern
                currentPosition = wordPosition + word.length;  // Update current position in the line
            }
    
            lineOffset += line.length + 1;  // Adjust offset for next line (include newline character)
            lineIndex++;  // Move to the next line
        }
    
        return root;
    }
    

    private searchTrie(root: Node, string: String){
        let current: Node = root;

        for (let i = 0; i < string.length; i++){
            if (current.children[string[i]] !== undefined){
                current = current.children[string[i]];
            }
            else {
                return undefined;
            }
        }

        return current;
    }

    /**
     * updates the index used to handle queries
     * @param documents list of documents used to create the index
     */
    public updateIndex(document: Document, extensionContext: ExtensionContext): void {
        // TODO: implement this.
        const existingIndex = extensionContext.workspaceState.get<{ [documentName: string]: Node }>("index");
        if (existingIndex) {
            this.index = existingIndex;

            let words = document.contents.replace(/[^a-z0-9]/gi, ' ').split(" ");
            this.index[document.filename] = this.createTrie(words, document.contents, document.filePath);

            extensionContext.workspaceState.update("index", this.index);
        }


    }

    /**
     * handles the query
     * @param query the query to perform search for in the index
     * @returns A QueryResponse object with the results of the search
     */
    public handle(query: FuzzyQuery): QueryResponse {
        let processedQuery = query.getFormattedQuery();
        let word = processedQuery[0];
        let distance = parseInt(processedQuery[1]);
        const response: QueryResponse = { results: [] };
    
        for (const [filename, document] of Object.entries(this.index)) {
            let endNodes: { prefix: string; positions: number[], actualDistance: number, filePath: string }[] = []; // Add filePath
    
            for (const child of Object.values((document as Node).children)) {
                let firstRow: number[] = [];
                for (let i = 0; i < word.length + 1; i++) {
                    firstRow.push(i);
                }
    
                this.matchStringRecursive(child as Node, word, distance, endNodes, firstRow, 0);
            }
    
            // Process results with actual distances and file paths
            for (let j = 0; j < endNodes.length; j++) {
                endNodes[j].positions.forEach(position => {
                    response.results.push({
                        documentID: filename,
                        filePath: endNodes[j].filePath,   // Return the filePath from the Node
                        position: position,   // Position within the document
                        distance: endNodes[j].actualDistance,   // Actual distance of the match
                        word: endNodes[j].prefix
                    });
                });
            }
        }
    
        return response;
    }
    
    private matchStringRecursive(
        node: Node,
        string: string,
        distance: number,
        endNodes: { prefix: string; positions: number[], actualDistance: number, filePath: string }[], // Add filePath
        previousRow: number[],
        currentStart: number
    ): void {
        const size: number = previousRow.length;
        let currentRow: number[] = [];
        
        currentRow.push(previousRow[0] + 1);
        
        let minimumElement = currentRow[0];
        
        for (let i = 1; i < size; i++) {
            if (string[i - 1] === node.letter) {
                currentRow.push(previousRow[i - 1]);
            } else {
                currentRow.push(1 + Math.min(currentRow[i - 1], previousRow[i], previousRow[i - 1]));
            }
            
            if (currentRow[i] < minimumElement) {
                minimumElement = currentRow[i];
            }
        }
        
        // If the currentRow indicates a match within the distance and it's the end of a pattern
        if (currentRow[size - 1] <= distance && node.endOfPattern) {
            endNodes.push({ 
                prefix: node.prefix, 
                positions: node.positions, 
                actualDistance: currentRow[size - 1],
                filePath: node.filePath // Pass the filePath from the current node
            });
        }
        
        // Continue the search recursively if within distance
        if (minimumElement <= distance) {
            for (const child of Object.values(node.children)) {
                this.matchStringRecursive(child, string, distance, endNodes, currentRow, currentStart);
            }
        }
    }
}
