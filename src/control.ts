import WebSocket from 'ws';
import { SocketServer } from './socketserver';
import { Packet, PacketFormats } from './types';
import { PACKET_OPCODES } from './constants';
import { EventEmitter } from 'events';
import { type } from 'os';

/**
 * Represents a CONTROL server as the MASTER server sees it.
 */
export class Control extends EventEmitter {
    /**
     * @ignore
     */
    private finishedConnectingResolve?: Function
    public ip: string;
    public server: SocketServer;
    public shardRange?: [number, number];
    public socket: WebSocket;

    constructor(server: SocketServer, socket: WebSocket, ip: string) {
        super();
        this.ip = ip;
        this.server = server;
        this.socket = socket;

        this.socket.on('message', this.onMessage.bind(this));
    }

    public async connectClusters(shardRange: [number, number]) {
        this.shardRange = shardRange;
        return new Promise(async (resolve, reject) => {
            await this.sendConnect();

        })
    }

    public send<T = Packet>(data: T) {
        return this.server.send<T>(this.socket, data);
    }

    private onMessage(data: WebSocket.Data) {
        // all normal packets should be string as raw (JSON when parsed), send back error packet if they arent
        if(typeof data !== 'string') {

        }
    }

    public sendConnect() {
        // checks if a shard range is defined. if its not, this server is redundant.
        return this.send<PacketFormats.Connect>({
            o: PACKET_OPCODES.connect,
            d: {
                shardRange: this.shardRange || [],
                redundant: this.shardRange ? false : true
            }
        })
    }

    public sendError(message: string) {

    }
}