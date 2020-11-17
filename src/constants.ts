export const CLOSE_CODES = Object.freeze({
    unauthorized: {
        message: 'Unauthorized',
        code: 4001
    },
    malformedConnectionRequest: {
        message: 'Malformed Connection Request',
        code: 4002
    },
    alreadyConnected: {
        message: 'This host is already connected to this MASTER server',
        code: 4003
    },
    malformedPacket: {
        message: 'The server recieved a malformed packet',
        code: 4004
    }
})

export const DEFAULT_PORT = 8642;

export const IP_ADDR_HEADER_NAME = 'source';

export const PACKET_OPCODES = Object.freeze({
    0: 'info',
    1: 'fatal',
    2: 'command',
    3: 'offload',
    4: 'shutdown',
    5: 'initialise',
    6: 'connect',
    7: 'error',
    8: 'ack',
    info: 0,
    fatal: 1,
    command: 2,
    offload: 3,
    shutdown: 4,
    initialise: 5,
    connect: 6,
    error: 7,
    ack: 8
})

export const VALID_CONTROL_OPCODES = new Set([
    PACKET_OPCODES.info,
    PACKET_OPCODES.fatal,
    PACKET_OPCODES.error,
    PACKET_OPCODES.ack
])

export enum SocketServerStates {
    ESTABLISHING,
    AWAITING_CLIENTS,
    ACTIVE,
    CLOSING,
    CLOSED
}