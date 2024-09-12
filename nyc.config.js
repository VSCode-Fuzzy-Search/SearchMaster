/* eslint-disable @typescript-eslint/naming-convention */
'use-strict';

const MIN_COVERAGE = { branches: 90, functions: 90, lines: 90, statements: 90 };

module.exports = {
    extends : "@istanbuljs/nyc-config-typescript",
    all     : true,
    include : "src/extension/**/*.ts",

    reporter: ['text', 'lcov'],

    // Will fail if coverage % is below these thresholds:
    'check-coverage'    : true,
    branches            : MIN_COVERAGE.branches,
    functions           : MIN_COVERAGE.functions,
    lines               : MIN_COVERAGE.lines,
    statements          : MIN_COVERAGE.statements,
    watermarks          : {
        lines       : [MIN_COVERAGE.lines       , 100],
        functions   : [MIN_COVERAGE.functions   , 100],
        branches    : [MIN_COVERAGE.branches    , 100],
        statements  : [MIN_COVERAGE.statements  , 100]
    }
};
