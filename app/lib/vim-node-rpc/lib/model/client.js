"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const msgpack_lite_1 = tslib_1.__importDefault(require("msgpack-lite"));
const buffered_1 = tslib_1.__importDefault(require("./buffered"));
const meta_1 = require("../meta");
const events_1 = require("events");
const logger = require('../logger')('client');
class Response {
    constructor(encoder, requestId, codec) {
        this.codec = codec;
        this.encoder = encoder;
        this.requestId = requestId;
    }
    send(resp, isError) {
        if (this.sent) {
            throw new Error(`Response to id ${this.requestId} already sent`);
        }
        this.encoder.write(msgpack_lite_1.default.encode([
            1,
            this.requestId,
            isError ? [0, (resp instanceof Error) ? resp.message : resp] : null,
            !isError ? resp : null,
        ], { codec: this.codec }));
        this.sent = true;
    }
}
class Client extends events_1.EventEmitter {
    constructor(id) {
        super();
        this.id = id;
        this.pending = new Map();
        this.nextRequestId = 1;
        const codec = this.setupCodec();
        this.encodeStream = msgpack_lite_1.default.createEncodeStream({ codec });
        this.decodeStream = msgpack_lite_1.default.createDecodeStream({ codec });
        this.decodeStream.on('data', (msg) => {
            this.parseMessage(msg);
        });
        this.decodeStream.on('end', () => {
            this.detach();
            this.emit('detach');
        });
    }
    setClientInfo(info) {
        this.clientInfo = info;
    }
    get name() {
        return this.clientInfo ? this.clientInfo.name : '';
    }
    setupCodec() {
        const codec = msgpack_lite_1.default.createCodec();
        meta_1.Metadata.forEach(({ constructor }, id) => {
            codec.addExtPacker(id, constructor, (obj) => msgpack_lite_1.default.encode(obj.id));
            codec.addExtUnpacker(id, data => new constructor(msgpack_lite_1.default.decode(data)));
        });
        this.codec = codec;
        return this.codec;
    }
    attach(writer, reader) {
        this.encodeStream = this.encodeStream.pipe(writer);
        const buffered = new buffered_1.default();
        reader.pipe(buffered).pipe(this.decodeStream);
        this.writer = writer;
        this.reader = reader;
    }
    detach() {
        this.encodeStream.unpipe(this.writer);
        this.reader.unpipe(this.decodeStream);
    }
    request(method, args) {
        this.nextRequestId = this.nextRequestId + 1;
        this.encodeStream.write(msgpack_lite_1.default.encode([0, this.nextRequestId, method, args], {
            codec: this.codec
        }));
        return new Promise((resolve, reject) => {
            let resolved = false;
            setTimeout(() => {
                if (resolved)
                    return;
                reject(new Error(`request "${method}" timeout after 3000`));
            }, 3000);
            this.pending.set(this.nextRequestId, (err, result) => {
                resolved = true;
                if (err)
                    return reject(err);
                resolve(result);
            });
        });
    }
    notify(method, args) {
        logger.debug('notification:', method, args);
        this.encodeStream.write(msgpack_lite_1.default.encode([2, method, args], {
            codec: this.codec
        }));
    }
    // message from client
    parseMessage(msg) {
        const msgType = msg[0];
        logger.debug('message:', msg);
        if (msgType === 0) {
            // request
            //   - msg[1]: id
            //   - msg[2]: method name
            //   - msg[3]: arguments
            this.emit('request', msg[2].toString(), msg[3], new Response(this.encodeStream, msg[1], this.codec));
        }
        else if (msgType === 1) {
            // response to a previous request:
            //   - msg[1]: the id
            //   - msg[2]: error(if any)
            //   - msg[3]: result(if not errored)
            const id = msg[1];
            const handler = this.pending.get(id);
            this.pending.delete(id);
            handler(msg[2], msg[3]);
        }
        else if (msgType === 2) {
            // notification/event
            //   - msg[1]: event name
            //   - msg[2]: arguments
            this.emit('notification', msg[1].toString(), msg[2] || []);
        }
        else {
            this.encodeStream.write([1, 0, 'Invalid message type', null]);
        }
    }
}
exports.default = Client;
//# sourceMappingURL=client.js.map