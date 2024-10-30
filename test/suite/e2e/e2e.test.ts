/**
 * @file e2e.test.ts
 * @fileoverview This file contains the test suite for end-to-end testing of the extension.
 *               Testing is powered by the Chai assertion library.
 * @see {@link https://martinfowler.com/articles/practical-test-pyramid.html#End-to-endTests}
 * @see {@link https://www.chaijs.com/guide/styles/}
 */

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

// Name of the test suite. Also used as a prefix for the test messages.
const SUITE_NAME = 'End-to-End';

// Extends objects with a `should` property for chaining assertions.
var should = require('chai').should();

suite(`${SUITE_NAME} Test Suite`, () => {
	// Show a message before running the tests.
	vscode.window.showInformationMessage(`${SUITE_NAME} | Start all tests.`);

	// When the test suite is finished, show a message.
	suiteTeardown(done => {
		vscode.window.showInformationMessage(`${SUITE_NAME} | All tests completed!`);
		done();
	});

	// Example test using Chai assertion library.
	// TODO: Replace with real tests!
	test('Example Test', () => {
		let a = 1;
		a.should.be.equal(1);
		a.should.be.a('number');
	});
});
