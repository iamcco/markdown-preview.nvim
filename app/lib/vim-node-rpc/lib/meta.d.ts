export declare class Buffer {
    id: number;
    constructor(id: number);
}
export declare class Window {
    id: number;
    constructor(id: number);
}
export declare class Tabpage {
    id: number;
    constructor(id: number);
}
export interface ExtTypeConstructor<T> {
    new (...args: any[]): T;
}
export interface MetadataType {
    constructor: ExtTypeConstructor<Buffer | Tabpage | Window>;
    name: string;
}
export declare const Metadata: MetadataType[];
