import { Vector } from "./classes/Vector";

/**
 * Calculates the term-frequency vector of a given document and maintains a running record of the word frequencies
 * 
 * @param d - the document
 * @param words_dict - dictionary keeping track of word frequencies
 * @returns the tf vector and the updated dictionary of words which have appeared   
 */
export function tf(d: string, words_dict: Record<string, number> = {}): [Vector, Record<string, number>] {

    let words: string[];

    words = d.split(" ");

    words.forEach( (word: string) => {
        word = word.toLocaleLowerCase();
        if (words_dict[word]) {
            words_dict[word] += 1;
        } else {
            words_dict[word] = 1;
        }
    });

    let tf_vector = new Vector(Object.keys(words_dict).length);
    let i = 0;
    Object.keys(words_dict).forEach( (key) => {
        tf_vector.set_component(i, words_dict[key] / words.length);
        words_dict[key] = 0;
        i++;
    });

    return [tf_vector, words_dict];
    
}

/**
 * Calculates the inverse-document-frequency vector of a given list of documents
 * 
 * @param documents - list of documents
 * @returns the idf vector
 */
export function idf(documents: Vector[]): Vector {

    
    const n = documents.length;

    let counts: number[] = [];

    const num_words = documents[0].get_length();

    for (let i = 0; i < num_words; i++) {
        let count = 0;
        documents.forEach( (d) => {
            if (d.get_component(i) > 0) {
                count++;
            }
        });
        counts.push(count);
    }

    let idf_v = new Vector(num_words);
    for (let i = 0; i < num_words; i++) {
        idf_v.set_component(i, Math.log10(n / counts[i]));
    }

    return idf_v;

}

/**
 * Calculates the tf-idf vector of a particular document within a set of documents
 * 
 * @param tf_v - the term frequency vector of the document
 * @param idf_v - the inverse document frequency vector of the list of documents
 * @returns the tf-idf vector
 */
export function tf_idf(tf_v: Vector, idf_v: Vector): Vector {
    
    let num_words = tf_v.get_length();

    let tf_idf_vector = new Vector(num_words);

    for (let i = 0; i < num_words; i++) {
        tf_idf_vector.set_component(i, tf_v.get_component(i) * idf_v.get_component(i));
    }

    return tf_idf_vector;

}

/**
 * Returns the unit vector of a given vector
 * 
 * @param v - the vector
 * @returns the respective unit vector
 */
export function get_unit_vector(v: Vector): Vector {
    
    const size = v.get_length();
    let unit_vector = new Vector(size);

    const euclidean_length = v.euclidean_length();

    for (let i = 0; i < size; i++) {
        unit_vector.set_component(i, v.get_component(i) / euclidean_length);
    }

    return unit_vector;

}

/**
 * Calculates the dot product of two vectors
 * 
 * @param v1 - the first vector
 * @param v2 - the second vector
 * @returns the dot product
 */
export function dot_product(v1: Vector, v2: Vector): number {
    
    let prod = 0;

    for (let i = 0; i < v1.get_length(); i++) {
        prod += v1.get_component(i) * v2.get_component(i);
    }

    return prod;

 }

/**
 * Calculates the cosine similarity of two vectors
 * 
 * @param v1 - the first vector
 * @param v2 - the second vector
 * @returns the cosine similarity
 */ 
export function cosine_similarity(v1: Vector, v2: Vector): number {

    return dot_product(get_unit_vector(v1), get_unit_vector(v2));

 }
