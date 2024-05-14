import QueryResult from "./QueryResult";

export default interface RankedQueryResult extends QueryResult {
  readonly relativeRank: number;
  readonly score: number;
}
