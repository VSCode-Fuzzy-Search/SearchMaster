// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

// Has to be a dynamic import otherwise complains about "require() of ES module is not supported"...
import('chai').then(chai => {

	// Extends each object with a `should` property for chaining assertions.
	chai.should();

	suite('Extension Test Suite', () => {
		vscode.window.showInformationMessage('Start all tests.');

		test('Suite Sanity Test', () => {
			let a = 1;
			a.should.be.equal(1);
			a.should.be.a('number');
		});
	});
});
