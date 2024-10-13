"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const getInstance_1 = __importDefault(require("../functions/getInstance"));
exports.default = new forgescript_1.NativeFunction({
    name: "$queueLength",
    description: "Returns the length of the music queue.",
    version: "1.0.0",
    unwrap: true,
    output: forgescript_1.ArgType.Number,
    async execute(ctx) {
        const manager = (0, getInstance_1.default)(ctx.client);
        const queue = manager.getQueue(ctx.guild);
        return this.success(queue.songs.length);
    }
});
