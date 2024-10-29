import Document from "../../../Document";
import QueryBackend from "../QueryBackend";
import QueryResponse from "../../../results/QueryResponse";
import Query from "../../../queries/Query";
import { VectorIndex } from "./classes/VectorIndex";
import * as tf_idf from "./tf-idf-cosine-similarity";
import { Vector } from "./classes/Vector";
import RankedQueryResult from "../../../results/RankedQueryResult";

export default class VectorBackend extends QueryBackend {
    
    /**
     * Creates the index used to handle queries
     * @param documents list of documents used to create the index
     */
    protected generateIndex(documents: Document[]): void {

        this.index = new VectorIndex();

        let words: string[];
    
        for (let i=0; i<documents.length; i++) {
            words = documents[i].contents.split(" ");
            this.doc_details[documents[i].filename] = words.length;
            words.forEach((word: string) => {
                word = word.toLocaleLowerCase();
                if (this.index.doesWordExist(word) && this.index.hasWordAlreadyAppearedInDocument(word, documents[i].filename)) {
                    this.index.incrementCount(word, documents[i].filename);
                } else {
                    this.index.addWord(word, documents[i].filename);
                }
            });
        }
    }

    /**
     * updates the index used to handle queries
     * @param documents list of documents used to create the index
     */
    public updateIndex(documents: Document): void {
        // TODO: implement this.
    }

    /**
     * handles the query
     * @param query the query to perform search for in the index
     * @returns A QueryResponse object with the results of the search
     */
    public handle(query: Query): QueryResponse {
        let response: QueryResponse = {results: []};

        //  - treat query as document
        this.index.addQuery(query.getFormattedQuery());
        this.doc_details["query"] = query.getFormattedQuery().trim().split(/\s+/).length;

        // console.log(this.doc_details); 
        // console.log(this.index);

        //  - create tf-vector for each document (including query)
        let tf_vectors: Vector[] = [];
        let i = 0;
        Object.keys(this.doc_details).forEach( (key: string) => {
            tf_vectors.push(tf_idf.tf(this.doc_details, key, this.index));
            i++;
        });

        //  - created idf-vector 
        let idf_vector = tf_idf.idf(this.doc_details, this.index);

        //  - create tf-idf vector for each document
        let tf_idf_vectors: Vector[] = [];
        i = 0;
        Object.keys(this.doc_details).forEach( (key: string) => {
            tf_idf_vectors.push(tf_idf.tf_idf(tf_vectors[i], idf_vector));
            i++;
        });

        let cosine_similarities: number[] = []

        //  - calculate consine similarity of each document to query vector
        for (let i = 0; i<tf_idf_vectors.length; i++) {
            // TODO: ensure query tf_idf vector always at beginning or end of tf_idf_vectors list
            const tempSimilarity: number = tf_idf.cosine_similarity(tf_idf_vectors[tf_idf_vectors.length-1], tf_idf_vectors[i]);
            // if (tempSimilarity > 0 || tempSimilarity !== undefined) {
            //     cosine_similarities.push(tempSimilarity);
            // }
            console.log(tempSimilarity)
            cosine_similarities.push(tempSimilarity);
        }

        //  - rank output based on similarity
        //console.log(this.doc_details);
        // console.log(cosine_similarities);

        const res: [string, number][] = Object.entries(this.doc_details).map(([key, value], index) => [key, cosine_similarities[index]]);
        res.sort((a: [string, number], b: [string, number]) => b[1] - a[1]);
        //console.log(res);    

        for (let i=0; i<res.length; i++) {
            // if (res[i][1] > 0) {      
                
            // }
            // const rankedResult: RankedQueryResult = {documentID: res[i][0], relativeRank: i+1, score: res[i][1], word: "Word"};
            // response.results.push(rankedResult);
        }
        console.log(response);
        let filteredResponse: QueryResponse = {results: []};
        for (let i = 0; i < response.results.length; i++) {
            if ((response.results[i] as RankedQueryResult).score >0 && response.results[i].documentID !== 'query') {
                filteredResponse.results.push(response.results[i]);
            }
        }
        console.log(filteredResponse);
        return filteredResponse;
    }

}