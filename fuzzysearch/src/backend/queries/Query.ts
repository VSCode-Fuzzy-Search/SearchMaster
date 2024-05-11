export default abstract class Query<T> {
    // The formatted query that will be searched for
    protected formattedQuery: T | null = null;

    /**
     * converts string query into a usable format for specific backend
     * @param query query in string format
     */
    protected abstract parseFromString(query: string): T;

    /**
     * returns the formatted query
     * TODO: possibly create a custom error in case query is not formatted? 
     * @returns The query for backend to use
     */
    public getFormattedQuery(): T {
        return this.formattedQuery as T;
    }
}