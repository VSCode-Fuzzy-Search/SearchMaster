import Query from "../../queries/Query"

//TODO: change from T to any? - Aren

export interface QueryBackend<T> {
    index: T;
    hasIndex: () => boolean;
    handle: (query: Query) => QueryResponse;

}