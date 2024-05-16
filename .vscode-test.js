const { defineConfig } = require('@vscode/test-cli');

module.exports = defineConfig({
	files: 'src/test/suite/**/*.test.ts',
	mocha: {
		require: 'ts-node/register'
	}
});
