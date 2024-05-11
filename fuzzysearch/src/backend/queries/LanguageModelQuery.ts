export default class LanguageModelQuery<T> {
    // The formatted query that will be searched for
    protected formattedQuery: T | null = null;

    /**
     * converts string query into a usable format for specific backend
     * @param query query in string format
     */
    protected parseFromString(query: string): T{
        //TODO: implement this
        return null as T;
    }

    /**
     * returns the formatted query
     * TODO: possibly create a custom error in case query is not formatted? 
     * @returns The query for backend to use
     */
    public getFormattedQuery(): T {
        return this.formattedQuery as T;
    }
}