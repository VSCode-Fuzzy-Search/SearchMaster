import Query from "./Query";

export default class FuzzyQuery extends Query{
    // The formatted query that will be searched for

    /**
     * converts string query into a usable format for specific backend
     * @param query query in string format
     */
    protected parseFromString(query: string): void {
        //TODO: implement this

        let splitQuery: String[] = query.split("/");

        this.formattedQuery = splitQuery;
    }

    /**
     * returns the formatted query
     * TODO: possibly create a custom error in case query is not formatted? 
     * @returns The query for backend to use
     */
    public getFormattedQuery(): string {
        return this.formattedQuery;
    }
}