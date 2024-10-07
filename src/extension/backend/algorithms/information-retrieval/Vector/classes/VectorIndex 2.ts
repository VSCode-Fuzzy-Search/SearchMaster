export class VectorIndex {

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

    addQuery(query: string): void {
        let words = query.split(" ");
        words.forEach((word: string) => {
            word = word.toLocaleLowerCase();
            const doc_id: string = "query"
            if (this.doesWordExist(word) && this.hasWordAlreadyAppearedInDocument(word, doc_id)) {
                this.incrementCount(word, doc_id);
            } else {
                this.addWord(word, doc_id);
            }
        });
    }

}