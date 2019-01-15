"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const neovim = require('neovim');
const log4js = require('log4js');
const tslib = require('tslib');
const socketIO = require('socket.io');
exports.default = {
    neovim,
    log4js,
    tslib,
    'socket.io': socketIO
};
