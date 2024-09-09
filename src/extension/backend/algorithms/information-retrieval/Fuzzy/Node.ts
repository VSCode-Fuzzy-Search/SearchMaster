export default class Node {
    letter: string;
    prefix: string;
    children: { [key: string]: Node };
    endOfPattern: boolean;
    positions: number[]; 
    distance: number;

    constructor(letter: string, prefix: string) {
        this.letter = letter;
        this.prefix = prefix;
        this.children = {};
        this.endOfPattern = false;
        this.positions = [];
        this.distance = 0;
    }
}
