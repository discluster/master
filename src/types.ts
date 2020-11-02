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