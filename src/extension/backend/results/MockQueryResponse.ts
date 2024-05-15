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

        // Generate random document IDs
        this.results = Array.from({ length: 10 }, (_, index) => ({
            documentID: `doc${index + 1}_${this.generateRandomString()}`
        }));
    }

    private generateRandomString(): string {
        const length = 10; // Length of the random string
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';

        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        return result;
    }
}
