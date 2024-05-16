import { VectorIndex } from "./classes/VectorIndex";

function createIndex(documents: string[]): VectorIndex {
    let index = new VectorIndex();

    let words: string[];

    for (let i=0; i<documents.length; i++) {
        words = documents[i].split(" ");
        words.forEach((word: string) => {
            word = word.toLocaleLowerCase();
            if (index.doesWordExist(word) && index.hasWordAlreadyAppearedInDocument(word, i.toString())) {
                index.incrementCount(word, i.toString());
            } else {
                index.addWord(word, i.toString());
            }
        })
    }

    return index;
}

debugger;

const d0 = "the best Italian restaurant enjoy the best pasta";
const d1 = "American restaurant enjoy the best hamburger";
const d2 = "Korean restaurant enjoy the best bibimbap";
const d3 = "the best the best American restaurant";
const query = "American"

const corpus = [d0, d1, d2, d3, query];

createIndex(corpus)