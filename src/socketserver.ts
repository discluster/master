import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { MasterServer } from './master';
import { SocketServerStates, CLOSE_CODES } from './constants';
import { IncomingMessage } from 'http';

export interface SocketServer {
    on(event: 'establish', listener: () => void): this;
}

export class SocketServer extends EventEmitter {
    readonly master: MasterServer;
    private _server!: WebSocket.Server;
    private _sockets: WebSocket[] = [];
    private _state: SocketServerStates = SocketServerStates.CLOSED;

    constructor(master: MasterServer) {
        super();
        this.master = master;
    }

    get server() {
        if(!this._server) {
            throw new ReferenceError('Cannot access property server of SocketServer before establishing')
        }

        return this._server;
    }

    get sockets() {
        return this._sockets;
    }

    get state() {
        return this._state;
    }

    public async close() {
        if(this.state === SocketServerStates.CLOSED) {
            throw new Error('This SocketServer is already closed')
        }

        this.removeAllListeners();
        this.server.removeAllListeners();
        return new Promise((resolve, reject) => {
            this.server.close((err) => {
                if(err) reject(err);
                resolve();
            })
        })
    }

    private async createWebsocketServer(port: number) {
        return new Promise((resolve) => {
            this._server = new WebSocket.Server({
                port,
                maxPayload: 1024 * 1024
            }, resolve)
        })
    }

    public async establish(port: number) {
        this._state = SocketServerStates.ESTABLISHING;
        await this.createWebsocketServer(port);
        this.server.on('connection', this.onConnection.bind(this));
    }

    private onConnection(socket: WebSocket, request: IncomingMessage) {
        // make sure the socket is authorized
        const authorization = request.headers.authorization;
        if(this.master.authorization) {
            if(!authorization || authorization !== this.master.authorization) {
                return socket.close(CLOSE_CODES.unauthorized.code, CLOSE_CODES.unauthorized.message)
            }
        }
        this.send(socket, '');

        this.sockets.push(socket);
    }

    public async send(socket: WebSocket, data: any) {
        return new Promise((resolve, reject) => {
            socket.send(data, (err) => {
                if(err) reject(err);
                resolve();
            })
        });
    }
}