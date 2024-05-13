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
        // TODO: implement this.
        this.index = { "Hello": [documents[0].filename, documents[1].filename, documents[2].filename],
        "Bye": [documents[1].filename, documents[2].filename],
        "Goodbye": [documents[0].filename]
        }
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
        // TODO: implement this.
        const response: QueryResponse = {results: []};

        let processedQuery = query.getFormattedQuery();
        let andArray = []

        for (let i = 0; i < processedQuery.length; i++){

            if (processedQuery[i] == "AND"){

                let arr1 = (this.index as {[word: string]: string[]})[processedQuery[i - 1]]
                let arr2 = (this.index as {[word: string]: string[]})[processedQuery[i + 1]]
                

                for (let j = 0; j < arr2.length; j++){
                    if (arr1.includes(arr2[j])){
                        andArray.push(arr2[j])
                    }
                }

            }

        }

        for (let i = 0; i < andArray.length; i++){
            response.results.push({documentID: andArray[i]})
        }
        
        return response;
    }

}