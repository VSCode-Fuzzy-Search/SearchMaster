export default abstract class Query {
    // The formatted query that will be searched for
    protected formattedQuery: any;

    constructor(query: string){
        this.parseFromString(query);
    }

    /**
     * converts string query into a usable format for specific backend
     * @param query query in string format
     */
    protected abstract parseFromString(query: string): void;

    /**
     * returns the formatted query
     * TODO: possibly create a custom error in case query is not formatted? 
     * @returns The query for backend to use
     */
    public getFormattedQuery(): any {
        return this.formattedQuery as any;
    }
}