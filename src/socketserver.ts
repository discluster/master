import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { MasterServer } from './master';
import { SocketServerStates, CLOSE_CODES, PACKET_OPCODES, IP_ADDR_HEADER_NAME } from './constants';
import { IncomingMessage } from 'http';
import { Packet, PacketFormats } from './types';
import { Control } from './control';

export interface SocketServer {
    on(event: 'establish', listener: () => void): this;
}

export class SocketServer extends EventEmitter {
    readonly heartbeatInterval: number;
    readonly master: MasterServer;
    private _controlServers = new Map<string, Control>();
    private _server!: WebSocket.Server;
    private _state: SocketServerStates = SocketServerStates.CLOSED;

    constructor(master: MasterServer, heartbeatInterval: number) {
        super();
        this.heartbeatInterval = heartbeatInterval;
        this.master = master;
    }

    /**
     * All CONTROL servers that have connected to this socket server at least once.
     * The CONTROL servers are not removed from this list if they disconnect.
     */
    get controlServers() {
        return this._controlServers;
    }

    get server() {
        if(!this._server) {
            throw new ReferenceError('Cannot access property server of SocketServer before establishing')
        }

        return this._server;
    }

    get state() {
        return this._state;
    }

    private async beginClusterConnections() {

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
        // wait 45 seconds before signalling to CONTROL servers to create clusters
        setTimeout(this.beginClusterConnections, 45000);
    }

    private onConnection(socket: WebSocket, request: IncomingMessage) {
        // make sure the socket is authorized
        const authorization = request.headers.authorization;
        if(this.master.authorization) {
            if(!authorization || authorization !== this.master.authorization) {
                return socket.close(CLOSE_CODES.unauthorized.code, CLOSE_CODES.unauthorized.message)
            }
        }

        const sourceIp = request.headers[IP_ADDR_HEADER_NAME];
        if(!sourceIp || Array.isArray(sourceIp)) {
            return socket.close(CLOSE_CODES.malformedConnectionRequest.code, CLOSE_CODES.malformedConnectionRequest.message);
        } else if(this.controlServers.get(sourceIp)) {
            return socket.close(CLOSE_CODES.alreadyConnected.code, CLOSE_CODES.alreadyConnected.message);
        }

        this.sendInitialisePacket(socket);

        this.controlServers.set(sourceIp, new Control(this, socket, sourceIp));
    }

    public send<T = Packet>(socket: WebSocket, data: T): Promise<void> {
        return new Promise((resolve, reject) => {
            socket.send(JSON.stringify(data), (err) => {
                if(err) reject(err);
                resolve();
            })
        });
    }

    public sendInitialisePacket(socket: WebSocket) {
        return this.send<PacketFormats.Initialise>(socket, {
            d: {
                token: this.master.token,
                heartbeat_interval: 50000
            },
            o: PACKET_OPCODES.initialise
        })
    }
}