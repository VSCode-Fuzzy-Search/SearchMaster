import { AlgorithmEnum } from "../AlgorithmEnum";
import BooleanQuery from "./BooleanQuery";
import LanguageModelQuery from "./LanguageModelQuery";
import UpdatedVectorQuery from "./UpdatedVectorQuery";
import VectorQuery from "./VectorQuery";
import TwoGramVectorQuery from "./TwoGramVectorQuery";

// potentially not an ideal approach, but can live with it for now - James
export default class QueryFactory {
    
    /**
     * Creates all query backends
     * @param query string of query
     * @param queryType enum of which algoirhtm to use for query
     * @returns select Query
     */
    public createQuery(query: string, queryType: AlgorithmEnum){

        if (queryType == AlgorithmEnum.Boolean){
            return new BooleanQuery(query);

        }
        else if (queryType == AlgorithmEnum.LanguageModel){
            return new LanguageModelQuery(query);
        }

        else if (queryType == AlgorithmEnum.Vector){
            return new UpdatedVectorQuery(query);
        }

        else if (queryType == AlgorithmEnum.TwoGramVector){
            return new TwoGramVectorQuery(query);
        }

    }

}