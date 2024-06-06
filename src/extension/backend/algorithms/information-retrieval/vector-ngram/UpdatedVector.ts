import { Vector } from "../Vector/classes/Vector";

export default class UpdatedVector{
    private vec: {[key: string]: number} = {};
    
    public addComponent(term: string, magnitude: number) {
        this.vec[term] = magnitude;
    }

    private getMagnitude(): number {
        let mag: number = 0;
        for (let term in this.vec) {
            mag += Math.pow(this.vec[term],2);
        } 
        return mag;
    }

    public getSimScore(other: UpdatedVector): number {
        throw new Error("Method not implemented.");
    }
}