"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const net_1 = tslib_1.__importDefault(require("net"));
let startPort = 8088;
function getPort() {
    return new Promise(resolve => {
        let server = net_1.default.createServer();
        server.listen(startPort, () => {
            server.once('close', () => {
                resolve(startPort);
            });
            server.close();
        });
        server.on('error', () => {
            startPort += 1;
            getPort().then(res => {
                resolve(res);
            });
        });
    });
}
exports.getPort = getPort;
//# sourceMappingURL=util.js.map