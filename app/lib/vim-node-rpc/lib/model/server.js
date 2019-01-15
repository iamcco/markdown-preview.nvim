"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const events_1 = tslib_1.__importDefault(require("events"));
const net_1 = tslib_1.__importDefault(require("net"));
const client_1 = tslib_1.__importDefault(require("./client"));
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const logger = require('../logger')('server');
const metaFile = path_1.default.join(__dirname, '../../data/api.json');
const metaData = JSON.parse(fs_1.default.readFileSync(metaFile, 'utf8'));
// a messagepack server
class MsgpackServer extends events_1.default {
    constructor(path, requester) {
        super();
        this.requester = requester;
        this.clients = [];
        let clientId = 1;
        this.server = net_1.default.createServer(socket => {
            let client = this.createClient(socket, clientId);
            clientId = clientId + 1;
            this.emit('connect', client.id);
        });
        this.server.on('close', this.onClose.bind(this));
        this.server.on('error', this.onError.bind(this));
        this.server.listen(path, () => {
            this.emit('ready');
        });
    }
    hasClient(name) {
        return this.clients.find(c => c.name == name) != null;
    }
    createClient(socket, clientId) {
        let client = new client_1.default(clientId);
        client.attach(socket, socket);
        this.clients.push(client);
        client.on('detach', () => {
            let idx = this.clients.findIndex(o => o.id == clientId);
            if (idx !== -1)
                this.clients.splice(idx, 1);
            this.emit('disconnect', client.id);
        });
        let id = 1;
        let setClientInfo = (name, version) => {
            if (this.hasClient(name)) {
                logger.error(`client ${name} exists!`);
            }
            client.setClientInfo({ name, version });
            this.emit('client', client.id, name);
        };
        client.on('request', (method, args, response) => {
            let rid = id;
            id = id + 1;
            logger.debug(`request ${rid}:`, method, args);
            if (method == 'vim_get_api_info' || method == 'nvim_get_api_info') {
                let res = [clientId, metaData];
                response.send(res, false);
                return;
            }
            if (method == 'nvim_set_client_info') {
                setClientInfo(args[0], args[1]);
                response.send(null, false);
                return;
            }
            this.requester.callNvimFunction(method, args).then(result => {
                logger.debug(`request result ${rid}:`, result);
                response.send(result, false);
            }, err => {
                logger.debug(`request error ${rid}: `, err.message);
                response.send(err, true);
            });
        });
        client.on('notification', (event, args) => {
            logger.debug('Client event:', event, args);
            if (event == 'nvim_set_client_info') {
                setClientInfo(args[0], args[1]);
            }
            this.emit('notification', event, args);
        });
        return client;
    }
    notify(clientId, method, args) {
        for (let client of this.clients) {
            if (clientId == 0) {
                client.notify(method, args);
            }
            else if (client.id == clientId) {
                client.notify(method, args);
            }
        }
    }
    request(clientId, method, args) {
        let client = this.clients.find(o => o.id == clientId);
        if (!clientId)
            Promise.reject(new Error(`Client ${clientId} not found!`));
        return client.request(method, args);
    }
    onClose() {
        for (let client of this.clients) {
            client.detach();
        }
        this.clients = [];
        this.emit('close');
    }
    onError(err) {
        logger.error('socket error: ', err.message);
    }
}
exports.default = MsgpackServer;
//# sourceMappingURL=server.js.map