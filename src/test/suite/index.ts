import { glob } from 'glob';
import * as Mocha from 'mocha';
import * as path from 'path';

export function run(): Promise<void> {
	// Create the mocha test runner.
	const MOCHA = new Mocha({ ui: 'tdd', color: true });
	var TESTS_ROOT = path.resolve(__dirname, '..');

	// Workaround for https://github.com/microsoft/vscode-test/issues/134
	// See also https://github.com/mochajs/mocha/issues/4851
	// Suggested by https://github.com/microsoft/vscode-test-cli/issues/49#issue-2381284091
	if (process.platform === 'win32') {
		TESTS_ROOT = TESTS_ROOT.toLowerCase();
	}

	return new Promise((resolve, reject) => {
		glob('**/**.test.js', { cwd: TESTS_ROOT }).then(files => {
			// Add files to the test suite
			files.forEach(f => MOCHA.addFile(path.resolve(TESTS_ROOT, f)));

			// Run the mocha tests.
			try {
				MOCHA.run(failures => (failures ? reject(new Error(`${failures} tests failed.`)) : resolve()));
			} catch (err) {
				console.error(err);
				reject(err);
			}
		}, reject);
	});
}
