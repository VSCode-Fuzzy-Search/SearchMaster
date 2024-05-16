import { VectorIndex } from "./classes/VectorIndex";
import { Vector } from "./classes/Vector";

/**
 * Calculates the term-frequency vector of a given document
 * 
 * @param doc_id - the document
 * @param index - words index
 * @returns the tf vector
 */
export function tf(doc_details: {[key: string]: number}, doc_id: string, index: VectorIndex): Vector {

    /**
     *                 american     |n/M|
     *                 best         |n/M|
     *                 bibimap      |n/M|
     *                 enjoy        |n/M|
     *                 hamburger    |n/M|
     * tf_vector(dx) = italian      |n/M|
     *                 korean       |n/M|
     *                 pasta        |n/M|
     *                 restaurant   |n/M|
     *                 the          |n/M|
     * n = num occurrences of word
     * M = num words in document
     */    
    
    /**
     *                 american     |0/8|
     *                 best         |2/8|
     *                 bibimap      |0/8|
     *                 enjoy        |1/8|
     *                 hamburger    |0/8|
     * tf_vector(d0) = italian      |1/8|
     *                 korean       |0/8|
     *                 pasta        |1/8|
     *                 restaurant   |1/8|
     *                 the          |1/8|
     */

    // TODO a way to uniquely identify each document (see VectorBackend.ts line 23)
    // TODO to maintain a count for the number of words each document (see VectorBackend.ts line 20)
    const M: number = doc_details[doc_id];

    let tf_vector = new Vector(Object.keys(index.self).length);

    let i = 0;
    Object.keys(index.self).forEach( (key: string) => {
        if (index.self[key][doc_id] == undefined) {
            tf_vector.set_component(i, 0);
        } else {
            tf_vector.set_component(i, index.self[key][doc_id] / M);
        }
        i++;
    });

    return tf_vector;
    
}

/**
 * Calculates the inverse-document-frequency vector from an index
 * 
 * @param index - words index
 * @returns the idf vector
 */
export function idf(doc_details: {[key: string]: number}, index: VectorIndex): Vector {

    /**
     *                 american     |Log(M/n)|
     *                 best         |Log(M/n)|
     *                 bibimap      |Log(M/n)|
     *                 enjoy        |Log(M/n)|
     *                 hamburger    |Log(M/n)|
     * idf_vector =    italian      |Log(M/n)|
     *                 korean       |Log(M/n)|
     *                 pasta        |Log(M/n)|
     *                 restaurant   |Log(M/n)|
     *                 the          |Log(M/n)|
     * M = number of documents
     * n = num documents word appears in (Object.keys(index.self[word].length)
     */  

    /**
     *                 american     |Log(4/2)|
     *                 best         |Log(4/4)|
     *                 bibimap      |Log(4/1)|
     *                 enjoy        |Log(4/3)|
     *                 hamburger    |Log(4/1)|
     * idf_vector =    italian      |Log(4/1)|
     *                 korean       |Log(4/1)|
     *                 pasta        |Log(4/1)|
     *                 restaurant   |Log(4/4)|
     *                 the          |Log(4/4)|
     */  

    
    // TODO a way of maintaining the number of documents ({"doc_id": num_words_in_doc} maybe?? -> N={"d0": 8, "d1": 6, "d2": 6, "d4": 6}.length)
    const N = Object.keys(doc_details).length;

    let idf_v = new Vector(Object.keys(index.self).length);

    let i = 0;
    Object.keys(index.self).forEach( (key: string) => {
        idf_v.set_component(i, Math.log10(N / Object.keys(index.self[key]).length));   
        i++;
    });

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
