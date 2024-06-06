import { Vector } from "../Vector/classes/Vector";

export default class UpdatedVector{
    private vec: {[key: string]: number} = {};
    
    public addComponent(term: string, magnitude: number) {
        this.vec[term] = magnitude;
    }

    public getWeight(term: string): number {
        return this.vec[term];
    }

    public getMagnitude(): number {
        let mag: number = 0;
        for (let term in this.vec) {
            mag += Math.pow(this.vec[term],2);
        } 
        return mag;
    }

    public hasComponent(term: string): boolean {
        return term in this.vec;
    }

    public getSimScore(other: UpdatedVector): number {
        let score: number = 0;
        for (let term in this.vec) {
            if(other.hasComponent(term)) {
                score += this.getWeight(term) * other.getWeight(term);
            }    
        }
        score = score / this.getMagnitude();
        score = score / other.getMagnitude();
        return score;
    }

}