import { AlgorithmEnum } from './AlgorithmEnum';
import BackendFactory from './algorithms/information-retrieval/BackendFactory';
import QueryFactory from './queries/QueryFactory';

let backendFactory = BackendFactory.getInstance();

var startTimeIndex = performance.now();

// backendFactory.createAllBackends('./', extensionContext);

let queryFactory = new QueryFactory();
/** 
let booleanQuery = queryFactory.createQuery("Hello AND Goodbye", AlgorithmEnum.Boolean);
let vectorQuery = queryFactory.createQuery("jupiter", AlgorithmEnum.Vector);

let booleanBackend = backendFactory.getBackend(AlgorithmEnum.Boolean);
let vectorBackend = backendFactory.getBackend(AlgorithmEnum.Vector);
*/
//if (vectorQuery != null) {  
 //   let result = vectorBackend?.handle(vectorQuery);
 //   console.log(result);
//}



let fuzzyBackend = backendFactory.getBackend(AlgorithmEnum.Fuzzy);

var endTimeIndex = performance.now();

console.log(`Time to create index = ${(endTimeIndex - startTimeIndex)/1000}`)

var startTimeQuery = performance.now();

let fuzzyQuery1 = queryFactory.createQuery("month/2", AlgorithmEnum.Fuzzy);

if (fuzzyQuery1 != null) {
    let result = fuzzyBackend?.handle(fuzzyQuery1);
}

let fuzzyQuery2 = queryFactory.createQuery("potato/2", AlgorithmEnum.Fuzzy);

if (fuzzyQuery2 != null) {
    let result = fuzzyBackend?.handle(fuzzyQuery2);
}

var endTimeQuery = performance.now();

console.log(`Time for two queries = ${(endTimeQuery - startTimeQuery)/1000}`)

// if (booleanQuery !== null){
//     let result = booleanQuery && booleanBackend?.handle(booleanQuery);
//     console.log(result);
// }

// if (booleanQuery != null){
//     let result = booleanBackend?.handle(booleanQuery);
//     console.log(result);
// }

