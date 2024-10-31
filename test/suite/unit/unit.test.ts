/**
 * @file unit.test.ts
 * @fileoverview This file contains the test suite for unit testing of the extension.
 *               Testing is powered by the Chai assertion library.
 * @see {@link https://martinfowler.com/articles/practical-test-pyramid.html#UnitTests}
 * @see {@link https://www.chaijs.com/guide/styles/}
 */

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import { expect } from 'chai';
import { suite, test } from 'mocha';
import * as mockFs from 'mock-fs';
import * as path from 'path';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { AlgorithmEnum } from '../../extension/backend/AlgorithmEnum';
import BackendFactory from '../../extension/backend/algorithms/information-retrieval/BackendFactory';
import QueryFactory from '../../extension/backend/queries/QueryFactory';
import QueryResponse from '../../extension/backend/results/QueryResponse';

// import * as myExtension from '../../extension';

// Name of the test suite. Also used as a prefix for the test messages.
const SUITE_NAME = 'Unit';

// Extends objects with a `should` property for chaining assertions.
var should = require('chai').should();

// Mock extension context and workspace state.
let mockExtensionContext: vscode.ExtensionContext;
let mockWorkspaceState: any;

//functions to testing backend algorithms
function searchBackend(algorithm: AlgorithmEnum, query: string): QueryResponse | undefined {
	const backendFactory = BackendFactory.getInstance();
	const backend = backendFactory.getBackend(algorithm);

	const queryFactory = new QueryFactory();
	const queryObject = queryFactory.createQuery(query, algorithm);

	let result = queryObject && backend?.handle(queryObject);
	return result;
}

function runFuzzySearch(query: string, editDistance: number): QueryResponse | undefined {
	let fuzzyQuery = QueryFactory.getInstance().createQuery(
		query.toLocaleLowerCase() + '/' + editDistance,
		AlgorithmEnum.Fuzzy
	);
	let fuzzyBackend = BackendFactory.getInstance().getBackend(AlgorithmEnum.Fuzzy);
	return fuzzyQuery && fuzzyBackend?.handle(fuzzyQuery);
}

function setUpMockExtensionContext(): vscode.ExtensionContext {
	// Mock workspaceState with sinon
	mockWorkspaceState = {
		get: sinon.stub(),
		update: sinon.stub()
	};
	// Create a mock ExtensionContext
	mockExtensionContext = {
		workspaceState: mockWorkspaceState,
		globalState: {
			get: sinon.stub(),
			update: sinon.stub()
		},
		storagePath: 'mock-storage-path'
	} as unknown as vscode.ExtensionContext;

	return mockExtensionContext;
}

function restoreMocks() {
	mockFs.restore();
	sinon.restore();
}

suite(`${SUITE_NAME} Test Suite`, () => {
	// Show a message before running the tests.
	vscode.window.showInformationMessage(`${SUITE_NAME} | Start all tests.`);

	// When the test suite is finished, show a message.
	suiteTeardown(done => {
		vscode.window.showInformationMessage(`${SUITE_NAME} | All tests completed!`);
		done();
	});

	test('Boolean Backend eg', () => {
		//testing backend for boolean retrieval

		//Arrange + Act
		const result = searchBackend(AlgorithmEnum.Boolean, 'hello world');

		//Assert
		result?.should.be.a('object');
		result?.should.have.property('results');
		result?.results.should.be.a('array');
		result?.results.should.have.length.above(0);
	});

	test('fuzzy index retieval and update', () => {
		// Arrange
		const backendFactory = BackendFactory.getInstance();

		// Mock file system with test files
		mockFs({
			testPath: {
				file1Txt: 'This is a test file.',
				file2Txt: 'Another test file.'
			}
		});

		let mockExtensionContext = setUpMockExtensionContext();

		// Act
		backendFactory.createAllBackends('testPath', mockExtensionContext);
		const fuzzyBackend = backendFactory.getBackend(AlgorithmEnum.Fuzzy);

		// Assert
		fuzzyBackend?.should.not.be.undefined;
		sinon.assert.calledOnce(mockWorkspaceState.get); // Ensure the index retrieval was attempted
		sinon.assert.calledOnce(mockWorkspaceState.update); // Ensure the index was stored

		restoreMocks();
	});

	test('fuzzy 0 edit distance: 2 results across 2 files', () => {
		// Arrange
		const backendFactory = BackendFactory.getInstance();

		mockFs({
			testPath: {
				file1Txt: 'This is a test file.',
				file2Txt: 'Another test file.'
			}
		});

		let mockExtensionContext = setUpMockExtensionContext();

		// Act
		backendFactory.createAllBackends('testPath', mockExtensionContext);

		let result = runFuzzySearch('test', 0);

		// Assert
		result?.should.not.be.undefined;
		result?.should.have.property('results');
		result!.results[0].filePath.should.equal('test-path/file1.txt');
		// query!.corpusSize!.should.equal(2);
		// query!.duration!.should.be.a('number');
		//query!.duration!.should.be.greaterThan(0);

		restoreMocks();
	});

	test('fuzzy 0 edit distance, larger file with multiple results', () => {
		// Arrange
		const backendFactory = BackendFactory.getInstance();

		let mockExtensionContext = setUpMockExtensionContext();
		const filesPath = path.join(__dirname, '../../../../src/test/files');
		backendFactory.createAllBackends(filesPath, mockExtensionContext);

		//let query = searchBackend(AlgorithmEnum.Fuzzy, "this");
		let result = runFuzzySearch('this', 0);

		// Assert
		result?.should.not.be.undefined;
		result?.should.have.property('results');

		restoreMocks();
	});

	test('fuzzy 1 edit distance: add, delete and modify string operations work', () => {
		// Arrange
		const backendFactory = BackendFactory.getInstance();

		let mockExtensionContext = setUpMockExtensionContext();

		mockFs({
			testPath: {
				file1Txt: 'This is a test file.',
				file2Txt: 'Another text file.',
				file3Txt: 'We are testing text files in this test of texts.',
				file4Txt: 'My name is Tex.'
			}
		});

		backendFactory.createAllBackends('testPath', mockExtensionContext);
		//let query = searchBackend(AlgorithmEnum.Fuzzy, "this");
		let result = runFuzzySearch('text', 1);

		// Assert
		result?.should.not.be.undefined;
		result?.should.have.property('results');
		result!.results.length.should.equal(6);

		restoreMocks();
	});

	test('fuzzy testing location', () => {
		// Arrange
		const backendFactory = BackendFactory.getInstance();

		let mockExtensionContext = setUpMockExtensionContext();
		const filesPath = path.join(__dirname, '../../../../src/test/files');
		backendFactory.createAllBackends(filesPath, mockExtensionContext);

		let result = runFuzzySearch('Mocking', 0);

		// Assert
		result?.should.not.be.undefined;
		result?.should.have.property('results');
		expect(result!.results[0].position).to.deep.equal({
			wordPosition: 54,
			line: 1,
			wordIndex: 12
		});

		restoreMocks();
	});
});
