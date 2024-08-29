import Document from "../../../Document";
import QueryBackend from "../QueryBackend";
import QueryResponse from "../../../results/QueryResponse";
import FuzzyQuery from "../../../queries/FuzzyQuery";
import MinHeap from 'heap-js';

interface WordPosition {
    documentName: string;
    positions: number[];
}

class VPNode {
    vantage: string; // The vantage point word
    threshold: number; // Median distance used to split inner and outer nodes
    inner: VPNode | null; // Inner subtree (closer than the threshold)
    outer: VPNode | null; // Outer subtree (farther than the threshold)
    positions: WordPosition[]; // Positions of the vantage point word in documents

    constructor(vantage: string, threshold: number = 0, positions: WordPosition[] = []) {
        this.vantage = vantage;
        this.threshold = threshold;
        this.inner = null;
        this.outer = null;
        this.positions = positions;
    }
}

class VPTree {
    root: VPNode | null;

    constructor(items: { word: string; positions: WordPosition[] }[], distance: (a: string, b: string) => number) {
        // Build the VP Tree with the given items and distance function
        this.root = this.buildVPTree(items, distance);
    }

    /**
     * Recursively builds the VP Tree.
     * @param items - The items to build the tree from, each containing a word and its positions.
     * @param distance - The distance function used to measure the difference between words (e.g., Levenshtein distance).
     * @returns The root node of the VP Tree.
     */
    private buildVPTree(items: { word: string; positions: WordPosition[] }[], distance: (a: string, b: string) => number): VPNode | null {
        if (items.length === 0) return null; // Base case: No items to process

        // Choose a random vantage point to avoid biases that could lead to an unbalanced tree
        const vantageIndex = Math.floor(Math.random() * items.length);
        const vantage = items[vantageIndex].word;
        const vantagePositions = items[vantageIndex].positions;
        items.splice(vantageIndex, 1); // Remove the selected vantage point from the list

        if (items.length === 0) return new VPNode(vantage, 0, vantagePositions); // Only one item was present

        // Calculate distances from the vantage point to all other items
        const distances = items.map(item => ({
            word: item.word,
            dist: distance(vantage, item.word), // Levenshtein distance between the vantage point and current word
            positions: item.positions
        }));
        // Sort items by distance from the vantage point
        distances.sort((a, b) => a.dist - b.dist);

        // Use the median distance as the threshold to divide items into inner and outer sets
        const medianIndex = Math.floor(distances.length / 2);
        const medianDistance = distances[medianIndex].dist;

        // Split items into inner and outer subsets based on the median distance
        const innerSet = distances.slice(0, medianIndex).map(d => ({ word: d.word, positions: d.positions }));
        const outerSet = distances.slice(medianIndex).map(d => ({ word: d.word, positions: d.positions }));

        // Create a new node with the vantage point and threshold, then recursively build inner and outer subtrees
        const node = new VPNode(vantage, medianDistance, vantagePositions);
        node.inner = this.buildVPTree(innerSet, distance);
        node.outer = this.buildVPTree(outerSet, distance);

        return node;
    }

    /**
     * Searches the VP Tree for words within a certain edit distance from the query.
     * @param query - The query word.
     * @param maxDistance - The maximum allowable distance from the query.
     * @param distance - The distance function used to measure differences between words.
     * @returns A list of words with their distances and positions that are within the max distance from the query.
     */
    public search(query: string, maxDistance: number, distance: (a: string, b: string) => number): { word: string, dist: number, positions: WordPosition[] }[] {
        const results: { word: string, dist: number, positions: WordPosition[] }[] = [];
        // Use a MinHeap to manage nodes that need to be explored based on their distance
        const heap = new MinHeap<{ dist: number, node: VPNode | null }>((a, b) => a.dist - b.dist);

        // Start with the root node
        heap.push({ dist: 0, node: this.root });

        while (!heap.isEmpty()) {
            const { node } = heap.pop()!;
            if (!node) continue;

            const distToVP = distance(query, node.vantage); // Calculate distance from the query to the vantage point

            // If the distance to the vantage point is within the max distance, add it to the results
            if (distToVP <= maxDistance) {
                results.push({ word: node.vantage, dist: distToVP, positions: node.positions });
            }

            // Use the threshold to decide which subtrees to search
            if (distToVP - maxDistance <= node.threshold) {
                heap.push({ dist: distToVP, node: node.inner }); // Search inner subtree if within bounds
            }
            if (distToVP + maxDistance >= node.threshold) {
                heap.push({ dist: distToVP, node: node.outer }); // Search outer subtree if within bounds
            }
        }

        return results;
    }
}

export default class FuzzyBackend extends QueryBackend {

    /**
     * Creates the index used to handle queries by building a VP Tree.
     * @param documents - List of documents used to create the index.
     */
    protected generateIndex(documents: Document[]): void {
        const wordsWithPositions: { word: string, positions: WordPosition[] }[] = [];
        
        // Extract words and their positions from each document
        for (let doc of documents) {
            const content = doc.contents.replace(/[^a-z0-9]/gi, ' ').split(" "); // Split content into words
            content.forEach((word, index) => {
                if (!word) return; // Skip empty strings
                // Find or create an entry for each word
                let entry = wordsWithPositions.find(wp => wp.word === word);
                if (!entry) {
                    entry = { word, positions: [] };
                    wordsWithPositions.push(entry);
                }
                // Record the position of the word in the document
                const docEntry = entry.positions.find(p => p.documentName === doc.filename);
                if (docEntry) {
                    docEntry.positions.push(index);
                } else {
                    entry.positions.push({ documentName: doc.filename, positions: [index] });
                }
            });
        }
        
        // Build the VP Tree with the collected words and positions
        this.index = new VPTree(wordsWithPositions, this.levenshteinDistance);
    }

    /**
     * Updates the index used to handle queries by rebuilding the VP Tree with new documents.
     * @param documents - List of documents used to create the updated index.
     */
    protected updateIndex(documents: Document[]): void {
        this.generateIndex(documents); // Rebuild the tree with the new set of documents
    }

    /**
     * Levenshtein distance implementation to calculate edit distance between two strings.
     */
    private levenshteinDistance(a: string, b: string): number {
        const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
        // Initialize DP table for base cases
        for (let i = 0; i <= a.length; i++) dp[i][0] = i;
        for (let j = 0; j <= b.length; j++) dp[0][j] = j;

        // Compute the edit distance between strings a and b
        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                if (a[i - 1] === b[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1]; // No change needed if characters match
                } else {
                    // Minimum of insert, delete, or substitute
                    dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
                }
            }
        }

        return dp[a.length][b.length]; // Return the edit distance between the two strings
    }

    /**
     * Handles the query by searching the VP Tree for matches within the specified edit distance.
     * @param query - The query to perform search for in the index.
     * @returns A QueryResponse object with the results of the search.
     */
    public handle(query: FuzzyQuery): QueryResponse {
        if (!this.index) return { results: [] }; // Return empty results if index is not available
    
        const processedQuery = query.getFormattedQuery();
        const word = processedQuery[0];
        const distance = parseInt(processedQuery[1]);
    
        // Search the VP Tree for words matching the query within the specified distance
        const results = this.index.search(word, distance, this.levenshteinDistance);
    
        // Flatten and format the results, and sort by distance
        const formattedResults = results
            .flatMap((res: { word: string; dist: number; positions: any[]; }) =>
                // Map each position in a document to a formatted result string
                res.positions.map((p: { documentName: string; positions: number[]; }) => ({
                    word: res.word,
                    dist: res.dist,
                    documentID: `File: ${p.documentName}, Positions: ${p.positions.join(', ')}`
                }))
            )
            // Sort by distance in increasing order
            .sort((a: { dist: number; }, b: { dist: number; }) => a.dist - b.dist)
            // Format the output to include the word, distance, and file details
            .map((res: { word: any; dist: any; documentID: any; }) => ({
                documentID: `${res.word} Distance: ${res.dist} ${res.documentID}`
            }));
    
        return {
            results: formattedResults
        };
    } 
}

/*
A VP Tree is a data structure designed for efficient nearest-neighbor searches in metric spaces, 
where the distance between data points can be calculated using a distance metric (like Levenshtein distance for strings). 
It organizes the data hierarchically by selecting vantage points and partitioning the remaining points into subsets based on their distance to these vantage points.

VP Tree Construction (buildVPTree Method):
Choosing a Vantage Point:
A vantage point (VP) is randomly selected from the list of items. This point will serve as a reference to divide the remaining data points into two subsets.

Calculating Distances:
The distance between the chosen vantage point and all other items is calculated using the specified distance function (Levenshtein distance in this case).

Sorting and Splitting:
The items are sorted based on their distance from the vantage point.
The median distance is used as a threshold to divide the items into two subsets:
Inner Subset: Items that are closer to the vantage point than the median distance.
Outer Subset: Items that are farther from the vantage point than the median distance.

Recursive Construction:
The VP Tree node is created with the vantage point and the threshold.
The inner and outer subsets are recursively processed to build the left (inner) and right (outer) subtrees of the VP Tree.

Example of VP Tree Construction:
Suppose we have the following words and their positions in documents:
Word	Document	Positions
"cat"	doc1	[0, 4]
"bat"	doc2	[1]
"rat"	doc1	[3]
"car"	doc2	[0]
"bar"	doc1	[2]
Steps to build the VP Tree:

Select a Vantage Point: Suppose "cat" is randomly chosen as the vantage point.
Calculate Distances: Compute distances between "cat" and other words using Levenshtein distance:
"bat" -> Distance: 1
"rat" -> Distance: 1
"car" -> Distance: 2
"bar" -> Distance: 2
Sort and Split:
Sorted by distance: ["bat" (1), "rat" (1), "car" (2), "bar" (2)]
Median distance: 1 (between "rat" and "car")
Inner Subset: ["bat", "rat"]
Outer Subset: ["car", "bar"]
Recursive Construction:
Inner and outer subsets are recursively processed to build the inner and outer subtrees.

How the Search Function Works
The search function in the VP Tree uses a priority queue (MinHeap) to efficiently find words within a specified distance from the query word. 
Here’s a step-by-step explanation of the search process:

Initialization:

Start with the root of the VP Tree.
Push the root node into a MinHeap with its distance from the query set to 0.

Heap-Based Exploration:
The heap ensures that nodes with the smallest distance to the query are explored first.
Pop the node with the smallest distance from the heap and calculate its distance to the query word using the Levenshtein distance.

Checking Distance:
If the distance between the query and the current vantage point is within the maximum allowed distance (maxDistance), add the vantage point to the results.
Decide Which Subtrees to Explore:

If the distance to the vantage point minus the maxDistance is less than or equal to the node’s threshold, explore the inner subtree. This checks nodes that are closer.
If the distance to the vantage point plus the maxDistance is greater than or equal to the node’s threshold, explore the outer subtree. This checks nodes that are farther 
but still within the allowable distance.

Continue Until the Heap is Empty:
Repeat the process until the heap is empty, ensuring all relevant nodes have been checked.
Example of Searching in a VP Tree:
Let’s search for the word "bat" with a maximum distance of 1.

Step 1: Start at the root ("cat").
Distance from "bat" to "cat" is 1 (within the max distance).
Add "cat" to results.

Step 2: Explore inner subtree (closer words):
Inner subtree has "bat" and "rat".
Distances: "bat" (0), "rat" (1).
Both are within the max distance, so both are added to the results.

Step 3: Explore outer subtree (farther words):
Outer subtree has "car" and "bar".
Distances: "car" (2), "bar" (2).
Both exceed the max distance, so they are not added to the results.
Why Use a Heap?
Prioritization: The heap ensures that nodes closer to the query are explored first, which is essential for pruning irrelevant branches early in the search process.
Efficiency: By always exploring the nearest nodes first, the search minimizes unnecessary distance calculations, making the algorithm efficient even with large datasets.

Why better than Trie ? 
VP Trees use vantage points to recursively partition the space based on distance. 
This allows the tree to efficiently prune large portions of the search space that are outside the allowable distance range (maxDistance). 
By organizing data hierarchically with a focus on metric distances, VP Trees can rapidly eliminate irrelevant nodes, significantly reducing the number of distance 
calculations required.

Keys that are better than Trie:
 - Prune irrelevant search paths early, saving computational effort --> Handle better for over large datasets
Search operations typically involve logarithmic time complexity due to the balanced nature of VP trees. However,
for Trie, we need to use BFS to search through every single node in the dataset which is very time consuming !

 - Are more memory-efficient for approximate matching. Since space complexity for Tries can consume significant memory, 
 especially if the dataset is large or if there are many distinct prefixes, 
 because each node represents a character and has pointers to its children.


 ----------------------------------------------------------------------------------------------
=> Another way to solve this problem that I have a look at is:
- Generate all words from the given input string within the given edit distance
- Applying aho-corasick on it.
However, I don't think this way will be efficient enough since if the given query pattern is large, and
the edit distance will be around 4-5, it will take a lot of time to generate all possible words!
-----------------------------------------------------------------------------------------------

Fuzzy search = Data Structure(Optimized) + Levenshtein distance
The only thing left is we need to OPTIMIZE the Levenshtein distance!
T.T But it is quiet hard to going through the paper by myself.
*/