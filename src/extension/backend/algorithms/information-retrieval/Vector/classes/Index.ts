export class Index {

    self: { [key: string]: { [key: string]: number } };

    constructor() {
        this.self = {};
    }

    doesWordExist(word: string): boolean {
        return word in this.self;
    }

    addWord(word: string, document: string): void {
        if (!this.doesWordExist(word)) {
            this.self[word] = {};
        }

        this.self[word][document] = 1;
    }

    incrementCount(word: string, document: string): void {        
        this.self[word][document]++;
    }

    hasWordAlreadyAppearedInDocument(word: string, document: string): boolean {
        return document in this.self[word];
    }

    // TODO: generateTF-IDFVectors(): Vector {}
    //  - from the index create a list of tf vectors
    //  - create an idf vector 
    //  - for each tf vector:
    //      - tf-idf vector = mmult(tf-vector, transpose(idf-vector))

}