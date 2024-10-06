import * as fs from 'fs';
import { uuidv7 } from 'uuidv7';
import { AlgorithmEnum } from "../../AlgorithmEnum";
import Document from "../../Document";
import QueryBackend from "./QueryBackend";
import FuzzyBackend from './Fuzzy/FuzzyBackend';
import { ExtensionContext } from 'vscode';
import * as path from 'path';
 
export default class BackendFactory {
    private backends: Map<AlgorithmEnum, QueryBackend> = new Map<AlgorithmEnum, QueryBackend>;
    private static instance: BackendFactory;

    public static getInstance(): BackendFactory {
        if (!BackendFactory.instance) {
            BackendFactory.instance = new BackendFactory();
        }
        return BackendFactory.instance;
    }

    /**
     * Creates all query backends
     * @param path path in which to look for documents
     */
    public createAllBackends(path: string, extensionContext: ExtensionContext): void {

        let documents: Document[] = this.getDocuments(path);

        this.backends.set(AlgorithmEnum.Fuzzy, new FuzzyBackend(documents, extensionContext));
     }

    /**
     * Checks if there are backends
     * @returns true if there are backends
     */
    public hasBackends(): boolean {
        return this.backends !== null;
    }


    /**
     * Checks if there are backends
     * @param backendType Algorithm for required query
     * @returns selected backend
     */
    public getBackend(backendType: AlgorithmEnum){
        return this.backends.get(backendType);
    }

    /**
     * finds a list of documents in the path
     * @param path path in which to look for documents
     * @returns list of documents in the specified path
     */
    private getDocuments(path: string): Document[] {
        const documents: Document[] = [];
    
        // Helper function to process files recursively
        const processDirectory = (directoryPath: string) => {
            if (directoryPath.includes('node_modules')) {
                return;
            }

            const files = fs.readdirSync(directoryPath);
    
            for (let i = 0; i < files.length; i++) {
                const fullPath = `${directoryPath}/${files[i]}`;
    
                if (fs.lstatSync(fullPath).isDirectory()) {
                    // Recursively process subdirectories
                    processDirectory(fullPath);
                } else if (fs.lstatSync(fullPath).isFile()) {
                    const fileOutput: string = fs.readFileSync(fullPath, 'utf-8').toLocaleLowerCase();
                    documents.push({ id: uuidv7(), filename: files[i], contents: fileOutput, filePath: fullPath });
                }
            }
        };

        // 
    
        // Start processing from the root path
        processDirectory(path);
    
        return documents;
    }

    updateBackendIndex(filePath: string, extensionContext: ExtensionContext): void {
        if (!filePath.includes('node_modules') && fs.lstatSync(filePath).isFile()) {
            let fileName = path.basename(filePath);
            let documentContents: string = fs.readFileSync(filePath, 'utf-8').toLocaleLowerCase();
            let document: Document = { id: uuidv7(), filename: fileName, contents: documentContents, filePath: filePath };
            this.getBackend(AlgorithmEnum.Fuzzy)?.updateIndex(document, extensionContext);
        }
    }
}