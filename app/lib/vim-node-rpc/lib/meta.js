"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Buffer {
    constructor(id) {
        this.id = id;
    }
}
exports.Buffer = Buffer;
class Window {
    constructor(id) {
        this.id = id;
    }
}
exports.Window = Window;
class Tabpage {
    constructor(id) {
        this.id = id;
    }
}
exports.Tabpage = Tabpage;
exports.Metadata = [
    {
        constructor: Buffer,
        name: 'Buffer'
    },
    {
        constructor: Window,
        name: 'Window'
    },
    {
        constructor: Tabpage,
        name: 'Tabpage'
    },
];
//# sourceMappingURL=meta.js.map