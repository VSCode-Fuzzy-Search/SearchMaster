// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

// Extends objects with a `should` property for chaining assertions.
var should = require('chai').should();

suite('Unit Test Suite', () => {
	// Show a message before running the tests.
	vscode.window.showInformationMessage('Start all tests.');

	// When the test suite is finished, show a message.
	suiteTeardown(() => vscode.window.showInformationMessage('All tests completed!'));

	// Example test using Chai assertion library.
	test('Example Test', () => {
		let a = 1;
		a.should.be.equal(1);
		a.should.be.a('number');
	});
});
