import{ PACKET_OPCODES } from './constants';

/**
 * The standard for all packets sent between MASTER and CONTROL
 */
export interface Packet {
    /**
     * Packet data
     */
    d: { [key: string]: any }
    /**
     * Packet opcode
     */
    o: number
}

export namespace PacketFormats {
    export interface Connect extends Packet {
        d: {
            shardRange: [number, number] | [],
            redundant: boolean
        }
    }
    export interface Error extends Packet {
        d: {
            message: string
        }
    }
    export interface Initialise extends Packet {
        d: {
            token: string,
            heartbeat_interval: number
        }
    }
}