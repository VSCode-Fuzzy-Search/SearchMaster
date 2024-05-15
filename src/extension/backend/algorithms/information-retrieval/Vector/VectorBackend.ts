import Document from "../../../Document";
import QueryBackend from "../QueryBackend";
import QueryResponse from "../../../results/QueryResponse";
import Query from "../../../queries/Query";
import { Index } from "./classes/Index";

export default class VectorBackend extends QueryBackend {
    
    /**
     * Creates the index used to handle queries
     * @param documents list of documents used to create the index
     */
    protected generateIndex(documents: Document[]): void {
        this.index = new Index();

        let words: string[];
    
        for (let i=0; i<documents.length; i++) {
            words = documents[i].contents.split(" ");
            words.forEach((word: string) => {
                word = word.toLocaleLowerCase();
                if (this.index.doesWordExist(word) && this.index.hasWordAlreadyAppearedInDocument(word, i.toString())) {
                    this.index.incrementCount(word, i.toString());
                } else {
                    this.index.addWord(word, i.toString());
                }
            });
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
        const response: QueryResponse = {results: []};
        // TODO: implement this.

        // see td-idf-cosine-similarity.ts main():
        //  - create tf-vector for query
        //  - create tf-vector for each document
        //  - created idf-vector 
        //  - create tf-idf vector for each document
        //  - calculate consine similarity of each document to query vector
        //  - rank output based on similarity

        return response;
    }

}