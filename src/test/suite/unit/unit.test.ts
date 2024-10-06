/**
 * @file unit.test.ts
 * @fileoverview This file contains the test suite for unit testing of the extension.
 *               Testing is powered by the Chai assertion library.
 * @see {@link https://martinfowler.com/articles/practical-test-pyramid.html#UnitTests}
 * @see {@link https://www.chaijs.com/guide/styles/}
 */

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import BackendFactory from '../../../extension/backend/algorithms/information-retrieval/BackendFactory';
import { AlgorithmEnum } from '../../../extension/backend/AlgorithmEnum';
import Query from '../../../extension/backend/queries/Query';
import QueryFactory from '../../../extension/backend/queries/QueryFactory';
import QueryBackend from '../../../extension/backend/algorithms/information-retrieval/QueryBackend';
import QueryResponse from '../../../extension/backend/results/QueryResponse';

// import * as myExtension from '../../extension';

// Name of the test suite. Also used as a prefix for the test messages.
const SUITE_NAME = 'Unit';

// Extends objects with a `should` property for chaining assertions.
var should = require('chai').should();


//functions to testing backend algorithms
function searchBackend(algorithm: AlgorithmEnum, query: string): QueryResponse | undefined{
	const backendFactory = new BackendFactory();
	const backend = backendFactory.getBackend(algorithm);

	const queryFactory = new QueryFactory();
	const queryObject = queryFactory.createQuery(
		query,
		algorithm
	);

	let result = queryObject && backend?.handle(queryObject);
	return result;
}



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

	test('Boolean Backend example', () => {
		//testing backend for boolean retrieval


		//Arrange + Act
		const result = searchBackend(AlgorithmEnum.Boolean, "hello world");

		//Assert
		result?.should.be.a('object');
		result?.should.have.property('results');
		result?.results.should.be.a('array');
		result?.results.should.have.length.above(0);
	});
});