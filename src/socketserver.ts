import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { Master } from './master';

export class SocketServer extends EventEmitter {
    readonly master: Master
    public server!: WebSocket.Server

    constructor(master: Master) {
        super();
        this.master = master;
    }

    private async createWebsocketServer(port: number) {
        return new Promise((resolve) => {
            this.server = new WebSocket.Server({
                port,
                maxPayload: 1024 * 1024
            }, resolve)
        })
    }

    public async establish(port: number) {
        await this.createWebsocketServer(port);
    }
}