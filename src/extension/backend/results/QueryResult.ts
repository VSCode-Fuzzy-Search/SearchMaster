//interface to store the results returned from a query
export default interface QueryResult {
    readonly documentID: string;
    readonly filePath: string;
    readonly position: number;
    readonly distance: number;
    readonly word: string;
}
