import { AlgorithmEnum } from "../../AlgorithmEnum";
import Document from "../../Document";
import QueryBackend from "./QueryBackend";
import {v7 as uuidv7 } from 'uuid';

//TODO: im confused on this class. 
export default class BackendFactory {
    private backends: FactoryMap | null = null;

    // public createAllBackends(path: string): FactoryMap {
    //     this.backends = FactoryMap;
    // }

    /**
     * Checks if there are backends
     * @returns true if there are backends
     */
    public hasBackends(): boolean {
        if (this.backends !== null) {
            return true;
        }
        return false;
    }

    /**
     * finds a list of documents in the path
     * @param path path in which to look for documents
     * @returns list of documents in the specified path
     */
    private getDocuments(path: string): Document[] {
        // TODO: implement this
        const documents: Document[] = [];
        documents.push({id: uuidv7(), filename: "test", contents: "testcontents"});
        return documents;
    }
}

/**
 * Structure of the map of enums to specific backends
 */
interface FactoryMap {
    AlgorithmEnum: QueryBackend
}