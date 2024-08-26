
import Document from "../../../Document";
import QueryBackend from "../QueryBackend";
import QueryResponse from "../../../results/QueryResponse";
import Query from "../../../queries/Query";
import Node from "./Node";

export default class FuzzyBackend extends QueryBackend {
    
    /**
     * Creates the index used to handle queries
     * @param documents list of documents used to create the index
     */
    protected generateIndex(documents: Document[]): void {
    const index: {[documentName: string]: Node} = {};
    const prefix: string = "word-"
    for(let i = 0; i < documents.length; i++){
        let words = documents[i].contents.replace(/[^a-z0-9]/gi, ' ').split(" ");
        for(let j = 0; j < words.length; j++){
            index[documents[i].filename] = this.createTrie(words)
        }
    }

    this.index = index;
    }

    private createTrie(strings: String[]): Node {
        const root = new Node("", "");  // Initialize the root of the trie

        // Add all the strings to the trie
        for (const string of strings) {
            let current = root;
            for (let j = 0; j < string.length; j++) {
                const letter = string[j];
                // Add the letter to the trie if it doesn't exist
                if (!(letter in current.children)) {
                    const node = new Node(letter, string.substring(0, j + 1));
                    current.children[letter] = node;
                }
                current = current.children[letter];
            }
            current.endOfPattern = true;     // Mark the end of a pattern
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
    public handle(query: Query): QueryResponse {

        let processedQuery = query.getFormattedQuery();
        let word = processedQuery;
        let distance = 2;
        const response: QueryResponse = {results: []};

        for (const [filename, document] of Object.entries(this.index)){

            let endNodes: string[] = [];

            for (const child of Object.values((document as Node).children)) {
                let firstRow: number[] = [];
                for (let i = 0; i < word.length + 1; i++){
                    firstRow.push(i);
                }

                this.matchStringRecursive(child as Node, word, distance, endNodes, firstRow);
            }

            for (let j = 0; j < endNodes.length; j++){
                response.results.push({documentID: filename + ": " + endNodes[j]})
            }
        }
        
        return response;
    }

    private matchStringRecursive(node: Node, string: String, distance: number, endNodes: String[], previousRow: number[]): void{

        const size: number = previousRow.length;
        let currentRow: number[] = [];

        currentRow.push(previousRow[0] + 1);

        let minimumElement = currentRow[0];

        for (let i = 1; i < size; i++){

            if (string[i - 1] == node.letter){
                currentRow.push(previousRow[i - 1]);
            }
            else {
                currentRow.push(1 + Math.min(currentRow[i - 1], previousRow[i], previousRow[i - 1]))
            }

            if (currentRow[i] < minimumElement) {
                minimumElement = currentRow[i];
            }
        }

        if (currentRow[size - 1] <= distance && node.endOfPattern){
            endNodes.push(node.prefix)
        }

        if (minimumElement < distance){
            for (const child of Object.values(node.children)) {
                this.matchStringRecursive(child, string, distance, endNodes, currentRow)
            }
        }

    }

}