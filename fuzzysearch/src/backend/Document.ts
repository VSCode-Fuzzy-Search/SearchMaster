import {v7 as uuidv7 } from 'uuid';

export default interface Document {
    id: uuidv7;
    filename: string;
    contents: string;
}