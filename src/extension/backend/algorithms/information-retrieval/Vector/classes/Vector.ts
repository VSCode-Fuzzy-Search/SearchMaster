/**
 * Class represnting a vector in mult-dimensional space
 */
export class Vector {
 
    components: number[];

    /**
     * Initialises the vector as a list of 0's of a defined size
     * 
     * @param num_values - the size of the vector
     */
    constructor(num_values: number) {
        this.components = new Array(num_values).fill(0);
    }

    /**
     * Returns the element from a given index
     * 
     * @param index - the index of the item being retrieved
     * @returns the value at that index
     */
    get_component(index: number): number {
        return this.components[index];
    }

    /**
     * Returns the size of the vector
     * 
     * @returns the length of the components array
     */
    get_length(): number {
        return this.components.length;
    }

    /**
     * Modifies the value of a given index
     * 
     * @param index - the index of the value being modified
     * @param value - the value being assigned to the particular index
     */
    set_component(index: number, value: number): void {
        this.components[index] = value;
    }

    /**
     * Returns the Euclidean Length of the vector
     * 
     * @returns the square root of the sum of the squared components
     */
    euclidean_length(): number {
        let run_sum = 0;
        this.components.forEach( (component) => {
            run_sum += component ** 2;
        });
        return run_sum ** 0.5;
    }

    /**
     * Increases the size of the vector and sets the respective values to 0
     * 
     * @param new_size - the number of elements the vector should contain 
     */
    add_zeros(new_size: number): void {
        let current_length = this.get_length();
        let num_new_zeros = new_size - current_length;
        this.components = this.components.concat(new Array(num_new_zeros).fill(0));
    }

}