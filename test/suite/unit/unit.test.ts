/**
 * @file unit.test.ts
 * @fileoverview This file contains the test suite for unit testing of the extension.
 *               Testing is powered by the Chai assertion library.
 * @see {@link https://martinfowler.com/articles/practical-test-pyramid.html#UnitTests}
 * @see {@link https://www.chaijs.com/guide/styles/}
 */

// You can import and use all API from the 'vscode' module as well as import your extension to test it.
import { expect } from 'chai';
import { suite, test } from 'mocha';
import * as mockFs from 'mock-fs';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { AlgorithmEnum } from '../../../src/extension/backend/AlgorithmEnum';
import BackendFactory from '../../../src/extension/backend/algorithms/BackendFactory';
import QueryFactory from '../../../src/extension/backend/queries/QueryFactory';
import QueryResponse from '../../../src/extension/backend/results/QueryResponse';

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
		{
			query: query.toLocaleLowerCase(),
			editDistance: editDistance
		},
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
		result!.results[0].filePath.should.equal('testPath/file1Txt');
		result!.results[1].filePath.should.equal('testPath/file2Txt');

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
		const mockExtensionContext = setUpMockExtensionContext();
	
		// Set up mock filesystem
		mockFs({
			testPath: {
				file1Txt: 'This is a test file containing the word Mocking.',
				file2Txt: 'Another text file without the keyword.',
				file3Txt: 'Mockingbird is a different word that contains Mocking.',
			}
		});
	
		// Create backends with mock path and context
		backendFactory.createAllBackends('testPath', mockExtensionContext);
	
		// Act
		const result = runFuzzySearch('Mocking', 0);
	
		// Assert
		result?.should.not.be.undefined;
		result?.should.have.property('results');
		
		expect(result!.results[0].position).to.deep.equal({
			wordPosition: 40,
			line: 1,
			wordIndex: 8 
		});
	
		restoreMocks();
	});

	test('should return no results for a search term not present in any file', () => {
		// Arrange
		const backendFactory = BackendFactory.getInstance();
		let mockExtensionContext = setUpMockExtensionContext();
	
		mockFs({
			testPath: {
				file1Txt: 'This is a test file.',
				file2Txt: 'Another test file with content.'
			}
		});
	
		backendFactory.createAllBackends('testPath', mockExtensionContext);
	
		// Act
		let result = runFuzzySearch('nonexistent', 0);
	
		// Assert
		expect(result?.results).to.be.empty;
	
		restoreMocks();
	});
	
	test('should return no results for an empty search query', () => {
		// Arrange
		const backendFactory = BackendFactory.getInstance();
		let mockExtensionContext = setUpMockExtensionContext();
		
		mockFs({
			testPath: {
				file1Txt: 'Some sample content in file one.',
				file2Txt: 'Some more content in file two.'
			}
		});
	
		backendFactory.createAllBackends('testPath', mockExtensionContext);
	
		// Act
		let result = runFuzzySearch('', 0);
	
		// Assert
		expect(result?.results).to.be.empty;
	
		restoreMocks();
	});
	
	
});
