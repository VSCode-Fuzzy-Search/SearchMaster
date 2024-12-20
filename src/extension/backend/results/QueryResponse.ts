import QueryResult from "./QueryResult";
export default interface QueryResponse {
    readonly matchCount?: number; // number of times the query was found in the colleciton
    readonly corpusSize?: number; // number of documents in the collection that was looked through
    readonly results: QueryResult[] // list of the matched documents
}