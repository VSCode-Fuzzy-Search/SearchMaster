// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

// Extends objects with a `should` property for chaining assertions.
var should = require('chai').should();

suite('Integration Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');
});