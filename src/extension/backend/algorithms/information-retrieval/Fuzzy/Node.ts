export default class Node{

    letter: String;
    children: {[child: string]: Node} = {};
    endOfPattern: boolean = false;
    prefix: String;

    constructor(letter: String, prefix: String){
        this.letter = letter;
        this.prefix = prefix;
    }

}