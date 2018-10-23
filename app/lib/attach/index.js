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
            const cursor = yield nvim.call('getpos', '.');
            const content = yield buffer.getLines();
            app.refreshPage({
                bufnr,
                data: {
                    cursor,
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
    nvim.on('request', (method, args, resp) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (method === 'close_all_pages') {
            app.closeAllPages();
        }
        resp.send();
    }));
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
