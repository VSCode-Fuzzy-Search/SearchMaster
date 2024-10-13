import { AlgorithmEnum } from "../AlgorithmEnum";
import FuzzyQuery from "./FuzzyQuery";

// potentially not an ideal approach, but can live with it for now - James
export default class QueryFactory {
    static instance: QueryFactory; // Singleton
    
    /**
     * Creates all query backends
     * @param query string of query
     * @param queryType enum of which algoirhtm to use for query
     * @returns select Query
     */

    public static getInstance(): QueryFactory {
        if (!QueryFactory.instance) {
            QueryFactory.instance = new QueryFactory();
        }
        return QueryFactory.instance;
    }

    public createQuery(query: any, queryType: AlgorithmEnum){

        if (queryType === AlgorithmEnum.Fuzzy){
            return new FuzzyQuery(query);
        }

    }

}