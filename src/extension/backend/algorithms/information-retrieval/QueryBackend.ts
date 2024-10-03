import Query from "../../queries/Query";
import QueryResponse from "../../results/QueryResponse";
import Document from "../../Document";
import { ExtensionContext } from "vscode";

export default abstract class QueryBackend {
    // Data structure used to perform the query matching on
    // TODO: is the "any" type okay here? - Aren
    // ^^^ I'm thinking so ATM, not many other options - James
    protected index: any | null=null;

    protected doc_details: {[key: string]: number} = {};
    // {"doc_id": num_words_in_doc}

    constructor(documents: Document[], extensionContext: ExtensionContext){
        this.generateIndex(documents, extensionContext);
    }

    /**
     * Creates the index used to handle queries
     * TODO: not made async. please see here: https://stackoverflow.com/questions/65355164/error-ts1243-async-modifier-cannot-be-used-with-abstract-modifier 
     * ^^^ Will have to just do it on the implementation side at the moment. - James
     * @param documents list of documents used to create the index
     */
    protected abstract generateIndex(documents: Document[], extensionContext: ExtensionContext): void;

    /**
     * updates the index used to handle queries
     * TODO: not made async. please see here: https://stackoverflow.com/questions/65355164/error-ts1243-async-modifier-cannot-be-used-with-abstract-modifier
     * ^^^ Will have to just do it on the implementation side at the moment. - James
     * TODO: could this method just invoke this.generateIndex rather than declare as abstract? perhaps fix the async todo in generateIndex first. 
     * ^^^ There could be more effecient ways to do this, maybe we can check if any files have been modified. This can be a later implementation, not required for MVP yet. - James
     * @param documents list of documents used to create the index
     */
    public abstract updateIndex(documents: Document, extensionContext: ExtensionContext): void;

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