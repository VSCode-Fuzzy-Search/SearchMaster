import {v7 as uuidv7 } from 'uuid';

export interface Document {
    id: uuidv7;
    filename: string;
    contents: string;
}