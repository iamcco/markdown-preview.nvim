/// <reference types="node" />
import Emitter from 'events';
export default class Connection extends Emitter {
    private readable;
    private writeable;
    private _ready;
    private _channel;
    constructor(readable: NodeJS.ReadableStream, writeable: NodeJS.WritableStream);
    private parseData;
    readonly channelId: Promise<number>;
    readonly isReady: boolean;
    response(requestId: number, data?: any): void;
    notify(event: string, data?: any): void;
    send(arr: any[]): void;
    redraw(force?: boolean): void;
    commmand(cmd: string): void;
    normal(cmd: string): void;
    expr(isNotify: any, expr: string): void;
    call(isNotify: any, func: string, args: any[]): void;
}
