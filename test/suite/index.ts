import { glob } from 'glob';
import * as Mocha from 'mocha';
import * as path from 'node:path';

export function run(): Promise<void> {
	// Create the mocha test runner.
	const MOCHA = new Mocha({ ui: 'tdd', color: true });
	const TESTS_ROOT = path.resolve(__dirname, '..');

	return new Promise((resolve, reject) => {
		glob('**/**.test.ts', { cwd: TESTS_ROOT }).then(files => {
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
