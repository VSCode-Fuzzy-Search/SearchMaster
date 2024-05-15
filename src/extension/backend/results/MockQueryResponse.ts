import QueryResponse from "./QueryResponse";
import QueryResult from "./QueryResult";

export default class MockQueryResponse implements QueryResponse {
    readonly duration: number;
    readonly matchCount: number;
    readonly corpusSize: number;
    readonly results: QueryResult[];

    constructor() {
        // Hardcoded values
        this.duration = 100; // Example duration in ms
        this.matchCount = 10; // Example match count
        this.corpusSize = 1000; // Example corpus size

        // Example QueryResults
        this.results = [
            { documentID: "doc1" },
            { documentID: "doc2" },
            { documentID: "doc3" },
            { documentID: "doc4" },
            { documentID: "doc5" },
            { documentID: "doc6" },
            { documentID: "doc7" },
            { documentID: "doc8" },
            { documentID: "doc9" },
            { documentID: "doc10" },
        ];
    }
}
