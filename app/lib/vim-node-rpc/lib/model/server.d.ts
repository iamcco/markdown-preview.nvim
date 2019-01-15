/// <reference types="node" />
import Emitter from 'events';
import Request from './request';
export default class MsgpackServer extends Emitter {
    private requester;
    private server;
    private clients;
    constructor(path: string, requester: Request);
    private hasClient;
    private createClient;
    notify(clientId: number, method: string, args: any[]): void;
    request(clientId: number, method: string, args: any[]): Promise<any>;
    private onClose;
    private onError;
}
