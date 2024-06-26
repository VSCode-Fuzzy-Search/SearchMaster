import * as fs from 'fs';
import { uuidv7 } from 'uuidv7';
import { AlgorithmEnum } from "../../AlgorithmEnum";
import Document from "../../Document";
import BooleanBackend from "./Boolean/BooleanBackend";
import LanguageModelBackend from "./LanguageModel/LanguageModelBackend";
import QueryBackend from "./QueryBackend";
import VectorBackend from "./Vector/VectorBackend";
 
export default class BackendFactory {
    private backends: Map<AlgorithmEnum, QueryBackend> = new Map<AlgorithmEnum, QueryBackend>;

    /**
     * Creates all query backends
     * @param path path in which to look for documents
     */
    public createAllBackends(path: string): void {

        let documents: Document[] = this.getDocuments(path);

         this.backends.set(AlgorithmEnum.Boolean, new BooleanBackend(documents));
         this.backends.set(AlgorithmEnum.Vector, new VectorBackend(documents));
         this.backends.set(AlgorithmEnum.LanguageModel, new LanguageModelBackend(documents));
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
        // TODO: implement this
        let files: Array<string> = fs.readdirSync(path);
        const documents: Document[] = [];

        for (let i = 0; i < files.length; i++){

            if (fs.lstatSync(path + "/" + files[i]).isFile()){
                let fileOutput: string = fs.readFileSync(path + "/" + files[i], 'utf-8');
            
                // let fileSplit: Array<string> = fileOutput.replace(/[(),'.:]/g, "").replace("[", "").replace("]", "").split(" ");

                documents.push({id: uuidv7(), filename: files[i], contents: fileOutput});
            }

        }

        return documents;
    }
}