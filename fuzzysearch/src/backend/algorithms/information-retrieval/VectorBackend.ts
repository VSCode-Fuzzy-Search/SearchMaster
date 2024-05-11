import Document from "../../Document";
import QueryBackend from "./QueryBackend";
import QueryResponse from "../../results/QueryResponse";
import Query from "../../queries/Query";

export default class VectorBackend extends QueryBackend {
    
    /**
     * Creates the index used to handle queries
     * @param documents list of documents used to create the index
     */
    protected generateIndex(documents: Document[]): void {
        // TODO: implement this.
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
        return response;
    }

}