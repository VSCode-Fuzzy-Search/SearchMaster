
import Document from "../../../Document";
import QueryBackend from "../QueryBackend";
import QueryResponse from "../../../results/QueryResponse";
import Query from "../../../queries/Query";
import Node from "./Node";
import FuzzyQuery from "../../../queries/FuzzyQuery";

export default class FuzzyBackend extends QueryBackend {
    
    /**
     * Creates the index used to handle queries
     * @param documents list of documents used to create the index
     */
    protected generateIndex(documents: Document[]): void {
        const index: { [documentName: string]: Node } = {};
        for (let i = 0; i < documents.length; i++) {
            let words = documents[i].contents.replace(/[^a-z0-9]/gi, ' ').split(" ");
            index[documents[i].filename] = this.createTrie(words, documents[i].contents);  // Pass the document contents
        }
    
        this.index = index;
    }

    private createTrie(words: string[], document: string): Node {
        const root = new Node("", "");  // Initialize the root of the trie
        let currentPosition = 0;
    
        for (const word of words) {
            let current = root;
            const wordPosition = document.indexOf(word, currentPosition);  // Find the position of the word in the document
    
            for (let j = 0; j < word.length; j++) {
                const letter = word[j];
                // Add the letter to the trie if it doesn't exist
                if (!(letter in current.children)) {
                    const node = new Node(letter, word.substring(0, j + 1));
                    current.children[letter] = node;
                }
                current = current.children[letter];
                // Add the position of the substring within the entire document
                if (j === word.length - 1) {
                    current.positions.push(wordPosition);
                }
            }
            current.endOfPattern = true; // Mark the end of a pattern
    
            currentPosition = wordPosition + word.length;  // Update currentPosition to continue the search
        }
    
        return root;
    }

    private searchTrie(root: Node, string: String){
        let current: Node = root;

        for (let i = 0; i < string.length; i++){
            if (current.children[string[i]] != undefined){
                current = current.children[string[i]]
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
    protected updateIndex(documents: Document[]): void {
        // TODO: implement this.
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
            let endNodes: { prefix: string; positions: number[] }[] = [];
    
            for (const child of Object.values((document as Node).children)) {
                let firstRow: number[] = [];
                for (let i = 0; i < word.length + 1; i++) {
                    firstRow.push(i);
                }
    
                this.matchStringRecursive(child as Node, word, distance, endNodes, firstRow, 0);
            }
    
            for (let j = 0; j < endNodes.length; j++) {
                endNodes[j].positions.forEach(position => {
                    response.results.push({
                        documentID: `${filename}: ${endNodes[j].prefix} with distance ${distance} at position ${position}`,
                        filePath: filename,  // Assuming filename is the relative path
                        position: position   // Position within the document
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
        endNodes: { prefix: string; positions: number[] }[], 
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
        
        if (currentRow[size - 1] <= distance && node.endOfPattern) {
            endNodes.push({ prefix: node.prefix, positions: node.positions });
        }
        
        if (minimumElement <= distance) {
            for (const child of Object.values(node.children)) {
                this.matchStringRecursive(child, string, distance, endNodes, currentRow, currentStart);
            }
        }
    }
}
