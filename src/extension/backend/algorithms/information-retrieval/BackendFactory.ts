import * as fs from 'fs';
import { uuidv7 } from 'uuidv7';
import { AlgorithmEnum } from "../../AlgorithmEnum";
import Document from "../../Document";
import BooleanBackend from "./Boolean/BooleanBackend";
import LanguageModelBackend from "./LanguageModel/LanguageModelBackend";
import QueryBackend from "./QueryBackend";
import VectorBackend from "./Vector/VectorBackend";
import FuzzyBackend from './Fuzzy/FuzzyBackend';
 
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
    public createAllBackends(path: string): void {

        let documents: Document[] = this.getDocuments(path);

         this.backends.set(AlgorithmEnum.Boolean, new BooleanBackend(documents));
         this.backends.set(AlgorithmEnum.Vector, new VectorBackend(documents));
         this.backends.set(AlgorithmEnum.LanguageModel, new LanguageModelBackend(documents));
         this.backends.set(AlgorithmEnum.Fuzzy, new FuzzyBackend(documents));
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
            const files = fs.readdirSync(directoryPath);
    
            for (let i = 0; i < files.length; i++) {
                const fullPath = `${directoryPath}/${files[i]}`;
    
                if (fs.lstatSync(fullPath).isDirectory()) {
                    // Recursively process subdirectories
                    processDirectory(fullPath);
                } else if (fs.lstatSync(fullPath).isFile()) {
                    const fileOutput: string = fs.readFileSync(fullPath, 'utf-8').toLocaleLowerCase();
                    documents.push({ id: uuidv7(), filename: files[i], contents: fileOutput });
                }
            }
        };
    
        // Start processing from the root path
        processDirectory(path);
    
        return documents;
    }
}