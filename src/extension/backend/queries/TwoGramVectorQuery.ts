import UpdatedVector from "../algorithms/information-retrieval/vector-ngram/UpdatedVector";
import Query from "./Query";
import { getListSubstringNLong } from "../../util";

export default class TwoGramVectorQuery extends Query{
    // The formatted query that will be searched for

    /**
     * converts string query into a usable format for specific backend
     * @param query query in string format
     */
    protected parseFromString(query: string): void {
        query = query.toLocaleLowerCase();
        let queryVec: UpdatedVector = new UpdatedVector();
        for (let term of getListSubstringNLong(2, query)) {  // adding all 2-grams to a vector
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