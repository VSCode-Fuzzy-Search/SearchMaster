import Document from "../../../Document";
import Query from "../../../queries/Query";
import QueryResponse from "../../../results/QueryResponse";
import QueryBackend from "../QueryBackend";
//TODO: no uuid is being used. should use this, but for now its filename
export default class UpdatedVectorBackend extends QueryBackend{
    private numberOfDocs: number = 0;
    protected generateIndex(documents: Document[]): void {
        this.index = {};
        for(let doc of documents) { // iterate through all documents
            let tempIndex: {[key: string]: number } = {};
            for (let word of doc["contents"].split(" ")) { // for each doc, add TF and doc id to index
                let lowercaseWord: string = word.toLocaleLowerCase();
                if (lowercaseWord in tempIndex) {
                    tempIndex[lowercaseWord] += 1;
                } else {
                    tempIndex[lowercaseWord] = 1;
                }
            }
            for (let word in tempIndex){
                if (word in this.index)  {
                    this.index[word][doc.filename] = tempIndex[word]; // maybe change .filename to .id after uuidv7 implemented properly
                } else {
                    this.index[word] = { [doc.filename]: tempIndex[word] }; // maybe change .filename to .id after uuidv7 implemented properly
                }
            }
            this.numberOfDocs += 1;
        }
    }
    protected updateIndex(documents: Document[]): void {
        throw new Error("Method not implemented.");
    }
    public handle(query: Query): QueryResponse {
        // let formattedQuery = query.toLocaleLowerCase();

        throw new Error("Method not implemented.");
    }
}
