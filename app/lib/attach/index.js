"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const neovim_1 = require("neovim");
const logger = require('../util/logger')('attach'); // tslint:disable-line
let app;
function default_1(options) {
    const nvim = neovim_1.attach(options);
    nvim.on('notification', (method, args) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const opts = args[0];
        const bufnr = opts.bufnr;
        const buffers = yield nvim.buffers;
        const buffer = buffers.find(b => b.id === bufnr);
        if (method === 'refresh_content') {
            const winline = yield nvim.call('winline');
            const cursor = yield nvim.call('getpos', '.');
            const name = yield buffer.name;
            const content = yield buffer.getLines();
            const currentBuffer = yield nvim.buffer;
            app.refreshPage({
                bufnr,
                data: {
                    isActive: currentBuffer.id === buffer.id,
                    winline,
                    cursor,
                    name,
                    content
                }
            });
        }
        else if (method === 'close_page') {
            app.closePage({
                bufnr
            });
        }
        else if (method === 'open_browser') {
            app.openBrowser({
                bufnr
            });
        }
    }));
    nvim.on('request', (method, args, resp) => {
        if (method === 'close_all_pages') {
            app.closeAllPages();
        }
        resp.send();
    });
    nvim.channelId
        .then((channelId) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield nvim.setVar('mkdp_node_channel_id', channelId);
    }))
        .catch(e => {
        logger.error('channelId: ', e);
    });
    return {
        nvim,
        init: (param) => {
            app = param;
        }
    };
}
exports.default = default_1;
