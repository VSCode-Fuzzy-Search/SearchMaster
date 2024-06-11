import Document from "../../../Document";
import Query from "../../../queries/Query";
import QueryResponse from "../../../results/QueryResponse";
import RankedQueryResult from "../../../results/RankedQueryResult";
import QueryBackend from "../QueryBackend";
import UpdatedVector from "./UpdatedVector";
//TODO: no uuid is being used. should use this, but for now its filename
export default class UpdatedVectorBackend extends QueryBackend{
    private numberOfDocs: number;

    constructor(documents: Document[]) {
        super(documents);
        this.numberOfDocs = documents.length;
    }

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
        }
    }

    protected updateIndex(documents: Document[]): void {
        throw new Error("Method not implemented.");
    }

    public handle(query: Query): QueryResponse {
        const start = performance.now();
        let response: QueryResponse = {results: []}; 
        let queryVec: UpdatedVector = query.getFormattedQuery();
        let docVectors: {[document: string]: UpdatedVector} = {};
        // create our map of document -> vector projections
        for (let term of queryVec.getComponents()) {
            if (!(term in this.index)) {
                break;
            }
            for (let document in this.index[term]) {
                if (document in docVectors) {
                    docVectors[document].addComponent(term, this.getTFIDF(term, document));
                } else {
                    docVectors[document] = new UpdatedVector();
                    docVectors[document].addComponent(term, this.getTFIDF(term, document));
                }
            }
        }

        // compute similarity scores between all relevant docs and query
        let scores: {[key: string]: number}[] =[]; 
        for (let doc in docVectors) {
            scores.push({[doc]: queryVec.getSimScore(docVectors[doc])});
        }

        // sort??
        const getValue = (obj: {[key: string]: number}) => Object.values(obj)[0];
        scores.sort((obj1, obj2) => getValue(obj2) - getValue(obj1));

        //returning result
        for (let i = 0; i < scores.length; i++) {
            let tempRankedResult: RankedQueryResult = {score: scores[i][Object.keys(scores[i])[0]], relativeRank : i+1, documentID: Object.keys(scores[i])[0]};
            response.results.push(tempRankedResult);
        }
        const end = performance.now();
        response.duration = end - start;
        return response;
    }

    private getIDF(word: string): number {
        if (!(word.toLocaleLowerCase() in this.index)) {
            return 0;
        }
        return Math.log(this.numberOfDocs/Object.keys(this.index[word.toLocaleLowerCase()]).length);
    }

    private getTF(word: string, doc: string): number {
        let lowerWord: string = word.toLocaleLowerCase();
        if (!(lowerWord in this.index)) {
            return 0;
        }  
        if (!(doc in this.index[lowerWord])) {
            return 0;
        }
        return this.index[lowerWord][doc];

    }

    private getTFIDF(word: string, doc: string) {
        return this.getTF(word, doc) * this.getIDF(word);
    }
}
