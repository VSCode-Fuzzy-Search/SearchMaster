import { AlgorithmEnum } from './AlgorithmEnum';
import BackendFactory from './algorithms/information-retrieval/BackendFactory';
import QueryFactory from './queries/QueryFactory';

let backendFactory = new BackendFactory();

backendFactory.createAllBackends('./src/extension/backend/documents/');

let queryFactory = new QueryFactory();

let booleanQuery = queryFactory.createQuery("Hello AND Goodbye", AlgorithmEnum.Boolean);
let vectorQuery = queryFactory.createQuery("jupiter", AlgorithmEnum.Vector);

let booleanBackend = backendFactory.getBackend(AlgorithmEnum.Boolean);
let vectorBackend = backendFactory.getBackend(AlgorithmEnum.Vector);

//if (vectorQuery != null) {  
 //   let result = vectorBackend?.handle(vectorQuery);
 //   console.log(result);
//}

let fuzzyBackend = backendFactory.getBackend(AlgorithmEnum.Fuzzy);

let fuzzyQuery = queryFactory.createQuery("month", AlgorithmEnum.Fuzzy);

if (fuzzyQuery != null) {
    let result = fuzzyBackend?.handle(fuzzyQuery);
    console.log(result)
}

// if (booleanQuery !== null){
//     let result = booleanQuery && booleanBackend?.handle(booleanQuery);
//     console.log(result);
// }

// if (booleanQuery != null){
//     let result = booleanBackend?.handle(booleanQuery);
//     console.log(result);
// }

