import { defineConfig } from '@vscode/test-cli';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const createTestEntry = label => ({
	label: `${label} Tests`,
	files: `out/test/suite/${label.toLowerCase()}/**/*.test.js`,
	workingDirectory: './test',
	version: process.env['VSCODE_VERSION'] ?? 'stable',
	launchArgs: ['--disable-updates', '--disable-crash-reporter', '--disable-workspace-trust', '--disable-telemetry'],
	mocha: {
		ui: 'tdd',
		color: true,
		timeout: 20000,
		require: 'ts-node/register',
		loader: 'ts-node/esm',
		reporter: path.join(__dirname, '.mocha-multi-reporter.js'),
		reporterOptions: {
			jsonReporterOptions: {
				output: path.join(__dirname, 'test-results', `mocha-${label.toLowerCase()}-tests.json`)
			}
		}
	}
});

export default defineConfig({
	tests: ['E2E', 'Exploratory', 'Integration', 'UI', 'Unit'].map(createTestEntry),
	coverage: {
		includeAll: true,
		exclude: ['**/test/**', '**/out/**', '**/src/**', '**/node_modules/**'],
		reporter: ['text', 'lcov'] // "lcov" also generates HTML report.
	}
});
