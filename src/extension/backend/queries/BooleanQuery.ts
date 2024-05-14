import Query from "./Query";

export default class BooleanQuery extends Query{
    // The formatted query that will be searched for

    /**
     * converts string query into a usable format for specific backend
     * @param query query in string format
     */
    protected parseFromString(query: string){
        //TODO: implement this
        let splitQuery = query.replace("(", "").replace(")", "").split(" ");
        this.formattedQuery = splitQuery;
    }

    /**
     * returns the formatted query
     * TODO: possibly create a custom error in case query is not formatted? 
     * @returns The query for backend to use
     */
    public getFormattedQuery(): string[] {
        if (this.formattedQuery != null){
            return this.formattedQuery;
        }
        else {
            return [];
        }
    }
}