"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const events_1 = tslib_1.__importDefault(require("events"));
const logger = require('../logger')('connection');
class Connection extends events_1.default {
    constructor(readable, writeable) {
        super();
        this.readable = readable;
        this.writeable = writeable;
        this._ready = false;
        this.readable = process.stdin;
        this.writeable = process.stdout;
        let buffered = Buffer.alloc(0);
        this.readable.on('data', (chunk) => {
            let start = 0;
            for (const pair of chunk.entries()) {
                const [idx, b] = pair;
                if (b == 10) {
                    this.parseData(Buffer.concat([buffered, chunk.slice(start, idx)]));
                    start = idx + 1;
                    buffered = Buffer.alloc(0);
                }
            }
            if (start == 0) {
                buffered = Buffer.concat([buffered, chunk]);
            }
            else if (start != chunk.length) {
                buffered = chunk.slice(start);
            }
        });
    }
    parseData(buf) {
        if (buf.length == 0)
            return;
        let str = buf.toString('utf8');
        let arr;
        try {
            arr = JSON.parse(str);
        }
        catch (e) {
            logger.error('Invalid data from vim', str);
        }
        let [id, obj] = JSON.parse(str);
        if (arr.length > 2) {
            logger.error('Result array length > 2', arr);
        }
        if (id > 0) {
            this.emit('request', id, obj);
        }
        else if (id == 0) {
            if (obj[0] == 'ready') {
                let [channel] = obj[1];
                this._channel = channel;
                this._ready = true;
                this.emit('ready', channel);
            }
            else {
                this.emit('notification', obj);
            }
        }
        else {
            logger.debug('received response', id, obj);
            // response for previous request
            this.emit('response', id, obj);
        }
    }
    get channelId() {
        if (this._ready) {
            return Promise.resolve(this._channel);
        }
        return new Promise(resolve => {
            this.once('ready', () => {
                resolve(this._channel);
            });
        });
    }
    get isReady() {
        return this._ready;
    }
    response(requestId, data) {
        this.send([requestId, data || null]);
    }
    notify(event, data) {
        this.send([0, [event, data || null]]);
    }
    send(arr) {
        this.writeable.write(JSON.stringify(arr) + '\n');
    }
    redraw(force = false) {
        this.send(['redraw', force ? 'force' : '']);
    }
    commmand(cmd) {
        this.send(['ex', cmd]);
    }
    normal(cmd) {
        this.send(['normal', cmd]);
    }
    expr(requestId, expr) {
        if (typeof requestId === 'boolean' && requestId === true) {
            this.send(['expr', expr]);
            return;
        }
        this.send(['expr', expr, requestId]);
    }
    call(requestId, func, args) {
        if (typeof requestId === 'boolean' && requestId === true) {
            // notify
            this.send(['call', func, args]);
            return;
        }
        this.send(['call', func, args, requestId]);
    }
}
exports.default = Connection;
//# sourceMappingURL=connection.js.map