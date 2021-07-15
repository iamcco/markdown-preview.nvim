"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const log4js_1 = tslib_1.__importDefault(require("log4js"));
const os_1 = tslib_1.__importDefault(require("os"));
const path_1 = tslib_1.__importDefault(require("path"));
const MAX_LOG_SIZE = 1024 * 1024;
const MAX_LOG_BACKUPS = 10;
const LOG_FILE_PATH = process.env.VIM_MKDP_RPC_LOG_FILE || path_1.default.join(os_1.default.tmpdir(), 'vim-node-rpc.log');
const level = process.env.VIM_MKDP_RPC_LOG_LEVEL || 'info';
if (level === 'debug') {
    fs_1.default.writeFileSync(LOG_FILE_PATH, '', 'utf8');
}
log4js_1.default.configure({
    appenders: {
        out: {
            type: 'file',
            filename: LOG_FILE_PATH,
            maxLogSize: MAX_LOG_SIZE,
            backups: MAX_LOG_BACKUPS,
            layout: {
                type: 'pattern',
                // Format log in following pattern:
                // yyyy-MM-dd HH:mm:ss.mil $Level (pid:$pid) $categroy - $message.
                pattern: `%d{ISO8601} %p (pid:${process.pid}) [%c] - %m`,
            },
        }
    },
    categories: {
        default: { appenders: ['out'], level }
    }
});
module.exports = (name = 'vim-node-rpc') => {
    return log4js_1.default.getLogger(name);
};
//# sourceMappingURL=logger.js.map
