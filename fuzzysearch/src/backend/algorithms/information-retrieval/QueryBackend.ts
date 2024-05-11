import Query from "../../queries/Query"

//TODO: change from T to any? - Aren
//TODO: change to abstract class. 

export interface QueryBackend<T> {
    index: T;
    hasIndex: () => boolean;
    handle: (query: Query) => QueryResponse;

}