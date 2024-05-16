import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'out/test/**/*.test.js',
	mocha: {
		ui: 'tdd',
		timeout: 20000,
		require: 'ts-node/register',
		loader: 'ts-node/esm'
	}
});
