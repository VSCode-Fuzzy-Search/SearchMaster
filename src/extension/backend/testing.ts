import { AlgorithmEnum } from './AlgorithmEnum';
import BackendFactory from './algorithms/information-retrieval/BackendFactory';
import QueryFactory from './queries/QueryFactory';

let backendFactory = new BackendFactory()

backendFactory.createAllBackends('./src/backend/documents/');

let queryFactory = new QueryFactory();

let booleanQuery = queryFactory.createQuery("Hello AND Goodbye", AlgorithmEnum.Boolean);

let booleanBackend = backendFactory.getBackend(AlgorithmEnum.Boolean);

if (booleanQuery != null){
    let result = booleanBackend?.handle(booleanQuery);
    console.log(result);
}


