import Document from "../../../Document";
import QueryBackend from "../QueryBackend";
import QueryResponse from "../../../results/QueryResponse";
import Query from "../../../queries/Query";

export default class BooleanBackend extends QueryBackend {
    /**
     * Creates the index used to handle queries
     * @param documents list of documents used to create the index
     */
    protected generateIndex(documents: Document[]): void {
        // TODO: implement this.
        const index: {[word: string]: string[]} = {};
        for(let i = 0; i < documents.length; i++){
            let words = documents[i].contents.split(" ");
            for(let j = 0; j < words.length; j++){
                if(index[words[j]] === undefined){
                    index[words[j]] = [];
                }
                index[words[j]].push(documents[i].id);
            }
        }
    }

    /**
     * updates the index used to handle queries
     * @param documents list of documents used to create the index
     */
    protected updateIndex(documents: Document[]): void {
        // TODO: implement this.
    }

    /**
     * handles the query
     * @param query the query to perform search for in the index
     * @returns A QueryResponse object with the results of the search
     */
    public handle(query: Query): QueryResponse {
        // TODO: implement this.
        const response: QueryResponse = {results: []};

        let processedQuery = query.getFormattedQuery();
        let andArray = [];

        for (let i = 0; i < processedQuery.length; i++){

            if (processedQuery[i] === "AND"){

                let arr1 = (this.index as {[word: string]: string[]})[processedQuery[i - 1]];
                let arr2 = (this.index as {[word: string]: string[]})[processedQuery[i + 1]];
                

                for (let j = 0; j < arr2.length; j++){
                    if (arr1.includes(arr2[j])){
                        andArray.push(arr2[j]);
                    }
                }

            }

        }

        for (let i = 0; i < andArray.length; i++){
            response.results.push({documentID: andArray[i]});
        }
        
        return response;
    }

    private AND(left: any[], right: any[]): any[] {
        const res: any[] = [];
        let lIndex = 0;
        let rIndex = 0;
        const lSkip = Math.sqrt(left.length);
        const rSkip = Math.sqrt(right.length);
        while (lIndex < left.length && rIndex < right.length) {
            const lItem = left[lIndex];
            const rItem = right[rIndex];
            if (lItem === rItem) {
                res.push(lItem);
                lIndex += 1;
                rIndex += 1;
            } else if (lItem < rItem) {
                if (lIndex + lSkip < left.length && left[lIndex + lSkip] <= rItem) {
                    lIndex += lSkip;
                } else {
                    lIndex += 1;
                }
            } else {
                if (rIndex + rSkip < right.length && right[rIndex + rSkip] <= lItem) {
                    rIndex += rSkip;
                } else {
                    rIndex += 1;
                }
            }
        }
        return res;
    }

    private OR(left: any[], right: any[]): any[] {
        const res: any[] = [];
        let lIndex = 0;
        let rIndex = 0;
        while (lIndex < left.length || rIndex < right.length) {
            if (lIndex < left.length && rIndex < right.length) {
                const lItem = left[lIndex];
                const rItem = right[rIndex];
                if (lItem === rItem) {
                    res.push(lItem);
                    lIndex += 1;
                    rIndex += 1;
                } else if (lItem < rItem) {
                    res.push(lItem);
                    lIndex += 1;
                } else {
                    res.push(rItem);
                    rIndex += 1;
                }
            } else if (lIndex < left.length) {
                res.push(left[lIndex]);
                lIndex += 1;
            } else {
                res.push(right[rIndex]);
                rIndex += 1;
            }
        }
        return res;
    }

    private ANDNOT(right: any[], docs: any[]): any[] {
        const res: any[] = [];
        let rIndex = 0;
        for (const doc of docs) {
            if (doc !== right[rIndex]) {
                res.push(doc);
            } else if (rIndex + 1 < right.length) {
                rIndex += 1;
            }
        }
        return res;
    }
}