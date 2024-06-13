export function getNonce() {
    let text = "";
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

/**
 * splits a string into substrings of length N, whitespaces mark the end of a word
 * @param n length of the substrings
 * @param input the input string
 * @returns a list of strings, each item being a substring of the input with max length N
 */
export function getListSubstringNLong(n: number, input: string): string[] {
    
    const words = input.split(/\s+/).filter(word => word.length > 0);
    
    // Function to split a word into substrings of length N
    function splitWord(word: string): string[] {
        const substrings: string[] = [];
        for (let i = 0; i <= word.length - n; i++) {
            substrings.push(word.substring(i, i + n));
        }
        return substrings;
    }
    
    // Split each word into substrings of length N and flatten the result using map and reduce
    const result = words.map(splitWord).reduce((acc, val) => acc.concat(val), []);
    
    return result;
}