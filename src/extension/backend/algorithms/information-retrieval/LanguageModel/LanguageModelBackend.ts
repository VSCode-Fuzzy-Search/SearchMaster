import Document from "../../../Document";
import QueryBackend from "../QueryBackend";
import QueryResponse from "../../../results/QueryResponse";
import Query from "../../../queries/Query";

export default class LanguageModelBackend extends QueryBackend {
    
    /**
     * Creates the index used to handle queries
     * @param documents list of documents used to create the index
     */
    protected generateIndex(documents: Document[]): void {
        // TODO: implement this.
        // index = {(gram: string): [(fileName: string, count: number, probability: number)]}
        let index: {[gram: string]: [string, number, number][]} = {};
        const prefix: string = "word-"
        //get total words for each doc
        let totalWords: number[] = [];

        for (let i = 0; i < documents.length; i++){
            let words = documents[i].contents.split(" ");
            totalWords.push(words.length);
        }

        
        // for each document loop through each word and get unigrams - gram is the word and probability is the number of times the word appears in the document divided by the total number of words in the document
        for (let i = 0; i < documents.length; i++){
            let words = documents[i].contents.split(" ");
            for (let j = 0; j < words.length; j++){
                //get gram
                let gram = prefix + words[j];
                //update count for this word
                if (index[gram] === undefined){
                    index[gram] = [[documents[i].filename, 1, 1/totalWords[i]]];
                }
                else 
                {
                    //check if that doc is already at the index[gram]
                    let found = false;
                    for (let k = 0; k < index[gram].length; k++)
                    {
                        if (index[gram][k][0] === documents[i].filename){
                            index[gram][k][1]++;
                            index[gram][k][2] = index[gram][k][1]/totalWords[i];
                            found = true;
                            break;
                        }
                        
                    }
                    if (!found){
                        index[gram].push([documents[i].filename, 1, 1/totalWords[i]]);
                    }
                }
            }
        }
        this.index = index;

    }

    /**
     * updates the index used to handle queries
     * @param documents list of documents used to create the index
     */
    public updateIndex(documents: Document): void {
        // TODO: implement this.
    }

    /**
     * handles the query
     * @param query the query to perform search for in the index
     * @returns A QueryResponse object with the results of the search
     */
    public handle(query: Query): QueryResponse {
        // TODO: implement this.
        const response: QueryResponse = {results: []};

        let processedQuery = query.getFormattedQuery();
        const prefix: string = "word-"
        //go through index and find the all files where all the searched words are present

        //files need to contain all thhe words in the query
        let files: {[fileName: string]: number} = {};
        for (let i = 0; i < processedQuery.length; i++){
            let word = prefix +  processedQuery[i];
            if (this.index[word] !== undefined){
                for (let j = 0; j < this.index[word].length; j++){
                    let file = this.index[word][j][0];
                    if (files[file] === undefined){
                        files[file] = 1;
                    }
                    else{
                        files[file]++;
                    }
                }
            }
        }
        
        //add files to response
        for (let file in files){
            // response.results.push({documentID: file});
        }
        return response;
    }

}