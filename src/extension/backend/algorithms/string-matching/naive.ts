/**
 * Finds the occurrences of a pattern in text and returns the its respective indexes 
 * 
 * @param pattern - the string being searched for
 * @param text - the string being searched
 * @returns - list of indexes
 */
export function naive_search(pattern: string, text: string): number[] {
    /*
    Worst case time complexity = O(m(n-m+1))
        m = pattern length
        n = text length
    */

    let output: number[] = [];

    const m = pattern.length;
    const n = text.length;

    for (let i = 0; i <= n; i++) {
        let j = 0;

        while (j < m && text[i + j] == pattern[j]) {
            j++;
        }

        if (j == m) {
            output.push(i);
        }
    }

    return output;

}
