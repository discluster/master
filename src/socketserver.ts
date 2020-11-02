import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { MasterServer } from './master';
import { SocketServerStates, CLOSE_CODES, PACKET_OPCODES } from './constants';
import { IncomingMessage } from 'http';
import { Packet } from './types';

export interface SocketServer {
    on(event: 'establish', listener: () => void): this;
}

export class SocketServer extends EventEmitter {
    readonly heartbeatInterval: number;
    readonly master: MasterServer;
    private _server!: WebSocket.Server;
    private _sockets: WebSocket[] = [];
    private _state: SocketServerStates = SocketServerStates.CLOSED;

    constructor(master: MasterServer, heartbeatInterval: number) {
        super();
        this.heartbeatInterval = heartbeatInterval;
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

    /**
     * Closes the socket server and disconnects all CONTROL servers.
     */
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

    /**
     * Establishes the socket server and begins listening for CONTROL server connections.
     */
    public async establish() {
        this._state = SocketServerStates.ESTABLISHING;
        await this.createWebsocketServer(this.master.port);
        this._state = SocketServerStates.AWAITING_CLIENTS;
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
        this.sendInitialisePacket(socket);

        this.sockets.push(socket);
    }

    public send(socket: WebSocket, data: Packet): Promise<void> {
        return new Promise((resolve, reject) => {
            socket.send(JSON.stringify(data), (err) => {
                if(err) reject(err);
                resolve();
            })
        });
    }

    public sendInitialisePacket(socket: WebSocket) {
        return this.send(socket, {
            d: {
                token: this.master.token,
                heartbeat_interval: 50000
            },
            o: PACKET_OPCODES.initialise
        })
    }
}