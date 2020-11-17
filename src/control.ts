import WebSocket from 'ws';
import { SocketServer } from './socketserver';
import { Packet, PacketFormats } from './types';
import { PACKET_OPCODES, CLOSE_CODES, VALID_CONTROL_OPCODES } from './constants';
import { EventEmitter } from 'events';

export enum ControlStates {
    INITIALISING,
    INITIALISED,
    CONNECTED
}

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
    public state: ControlStates = ControlStates.INITIALISING

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
            this.finishedConnectingResolve = resolve;
        })
    }

    public send<T = Packet>(data: T) {
        return this.server.send<T>(this.socket, data);
    }

    private onMessage(data: WebSocket.Data) {
        const validPacket = this.validatePacket(data);
        if(!validPacket) {
            this.sendMalformedPacketError();
        }
    }

    public sendConnect() {
        // checks if a shard range is defined. if its not, this server is redundant.
        return this.send<PacketFormats.Connect>({
            d: {
                shardRange: this.shardRange || [],
                redundant: this.shardRange ? false : true
            },
            o: PACKET_OPCODES.connect
        })
    }

    public sendError(code: number, message: string, op: number = PACKET_OPCODES.error) {
        return this.send<PacketFormats.Error>({
            d: {
                code,
                message
            },
            o: op
        })
    }

    public sendInitialise() {
        return this.send<PacketFormats.Initialise>({
            d: {
                token: this.server.master.token,
                heartbeat_interval: 50000,
                shard_count: this.server.master.shardCount
            },
            o: PACKET_OPCODES.initialise
        })
    }

    public sendMalformedPacketError() {
        return this.sendError(CLOSE_CODES.malformedPacket.code, CLOSE_CODES.malformedPacket.message);
    }

    private validatePacket(data: WebSocket.Data): Packet | null {
        // all normal packets should be string as raw (JSON when parsed), send back error packet if they arent
        if(typeof data !== 'string') {
            return null;
        }

        let packet: Packet;
        try {
            packet = JSON.parse(data);
        } catch {
            return null;
        }

        if(!packet.o || !VALID_CONTROL_OPCODES.has(packet.o)) {
            return null;
        }

        return packet;
    }
}