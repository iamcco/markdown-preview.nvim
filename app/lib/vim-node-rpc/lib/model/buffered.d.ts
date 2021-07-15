/// <reference types="node" />
import { Transform } from 'stream';
export default class Buffered extends Transform {
    private chunks;
    private timer;
    constructor();
    private sendData;
    _transform(chunk: Buffer, _encoding: any, callback: any): void;
    _flush(callback: any): void;
}
