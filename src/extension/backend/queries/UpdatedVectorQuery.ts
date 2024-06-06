import UpdatedVector from "../algorithms/information-retrieval/vector-ngram/UpdatedVector";
import Query from "./Query";

export default class UpdatedVectorQuery extends Query{
    // The formatted query that will be searched for

    /**
     * converts string query into a usable format for specific backend
     * @param query query in string format
     */
    protected parseFromString(query: string): void {
        query = query.toLocaleLowerCase();
        let queryVec: UpdatedVector = new UpdatedVector();
        for (let term in query.split(" ")) {
            queryVec.addComponent(term, 1);
        }
        this.formattedQuery = queryVec;
    }

    /**
     * returns the formatted query
     * @returns The query for backend to use
     */
    public getFormattedQuery(): UpdatedVector {
        return this.formattedQuery;
    }
}