import Query from "../../queries/Query";
import QueryResponse from "../../results/QueryResponse";
import Document from "../../Document";

export default abstract class QueryBackend {
    // Data structure used to perform the query matching on
    // TODO: is the "any" type okay here? - Aren
    protected index: any | null=null;

    /**
     * Creates the index used to handle queries
     * TODO: not made async. please see here: https://stackoverflow.com/questions/65355164/error-ts1243-async-modifier-cannot-be-used-with-abstract-modifier 
     * @param documents list of documents used to create the index
     */
    protected abstract generateIndex(documents: Document[]): void;

    /**
     * updates the index used to handle queries
     * TODO: not made async. please see here: https://stackoverflow.com/questions/65355164/error-ts1243-async-modifier-cannot-be-used-with-abstract-modifier
     * TODO: could this method just invoke this.generateIndex rather than declare as abstract? perhaps fix the async todo in generateIndex first. 
     * @param documents list of documents used to create the index
     */
    protected abstract updateIndex(documents: Document[]): void;

    /**
     * Checks if the backend has an index
     * @returns true if the backend has an index, false otherwise
     */
    private hasIndex(): boolean {
        if (this.index !== null) {
            return true;
        }
        return false;
    }

    /**
     * handles the query 
     * @param query the query to perform search for in the index
     * @returns A QueryResponse object with the results of the search
     */
    public abstract handle(query: Query): QueryResponse;

}