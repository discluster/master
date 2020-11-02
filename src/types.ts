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
    export interface Initialise {
        d: {
            token: string,
            heartbeat_interval: number
        }
    }
}