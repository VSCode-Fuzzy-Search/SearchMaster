
import Document from "../../../Document";
import QueryBackend from "../QueryBackend";
import QueryResponse from "../../../results/QueryResponse";
import Query from "../../../queries/Query";

export default class BooleanBackend extends QueryBackend {
    
    /**
     * Creates the index used to handle queries
     * @param documents list of documents used to create the index
     */
    protected generateIndex(documents: Document[]): void {
    const index: {[word: string]: string[]} = {};
    const prefix: string = "word-"
    for(let i = 0; i < documents.length; i++){
        let words = documents[i].contents.replace(/[^a-z0-9]/gi, ' ').split(" ");
        for(let j = 0; j < words.length; j++){
            if (words[j] != ''){
                if(index[prefix + words[j]] === undefined){
                    index[prefix + words[j]] = [];
                }
                if (!index[prefix + words[j]].includes(documents[i].filename)){
                    index[prefix + words[j]].push(documents[i].filename);
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
        const prefix: string = "word-"

        let processedQuery = query.getFormattedQuery();
        let andArray = [];

        for (let i = 0; i < processedQuery.length; i++){

            if (processedQuery[i] == "AND"){

                let arr1 = (this.index as {[word: string]: string[]})[prefix + processedQuery[i - 1]];
                let arr2 = (this.index as {[word: string]: string[]})[prefix + processedQuery[i + 1]];
                
                if (arr1 == undefined || arr2 == undefined){
                    return response;
                }

                for (let j = 0; j < arr2.length; j++){
                    if (arr1.includes(arr2[j])){
                        andArray.push(arr2[j]);
                    }
                }

            }

        }

        for (let i = 0; i < andArray.length; i++){
            
        }
        
        return response;
    }

}
