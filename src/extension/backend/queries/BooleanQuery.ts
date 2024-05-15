import Query from "./Query";

export default class BooleanQuery extends Query{
    // The formatted query that will be searched for

    /**
     * converts string query into a usable format for specific backend
     * @param query query in string format
     */
    protected parseFromString(query: string){
        const precedence: {[key: string]: number} = {};
        precedence['*'] = 4;
        precedence['NOT'] = 3;
        precedence['AND'] = 2;
        precedence['OR'] = 1;
        precedence['('] = 0;
        precedence[')'] = 0;
        //TODO: implement this
        const output: string[] = [];
        const operatorStack: string[] = [];

        for (const token of query) {
            if (token === '(') {
                operatorStack.push(token);
            } else if (token === ')') {
                let operator = operatorStack.pop() ?? '';
                while (operator !== '(') {
                    output.push(operator);
                    operator = operatorStack.pop()!;
                }
            } else if (token in precedence) {
                while (operatorStack.length && precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]) {
                    output.push(operatorStack.pop()!);
                }
                operatorStack.push(token);
            } else {
                output.push(token);
            }
        }

        while (operatorStack.length) {
            output.push(operatorStack.pop()!);
        }

        return output;
    }

    /**
     * returns the formatted query
     * TODO: possibly create a custom error in case query is not formatted? 
     * @returns The query for backend to use
     */
    public getFormattedQuery(): string[] {
        if (this.formattedQuery !== null){
            return this.formattedQuery;
        }
        else {
            return [];
        }
    }
}