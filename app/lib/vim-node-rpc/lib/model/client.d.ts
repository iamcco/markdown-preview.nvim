/// <reference types="node" />
import { EventEmitter } from 'events';
interface ClientInfo {
    name: string;
    version?: object;
}
export default class Client extends EventEmitter {
    readonly id: number;
    private pending;
    private nextRequestId;
    private encodeStream;
    private decodeStream;
    private reader;
    private writer;
    private codec;
    private clientInfo;
    constructor(id: number);
    setClientInfo(info: ClientInfo): void;
    readonly name: string;
    private setupCodec;
    attach(writer: NodeJS.WritableStream, reader: NodeJS.ReadableStream): void;
    detach(): void;
    request(method: string, args: any[]): Promise<any>;
    notify(method: string, args: any[]): void;
    private parseMessage;
}
export {};
