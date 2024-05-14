import { naive_search } from "./naive";

// Example 1
const txt1 = "AABAACAADAABAABA";
const pat1 = "AABA";
console.log("Example 1:");
console.log(naive_search(pat1, txt1));

// Example 2
const txt2 = "agd";
const pat2 = "g";
console.log("\nExample 2:");
console.log(naive_search(pat2, txt2));