export const CLOSE_CODES = Object.freeze({
    unauthorized: {
        message: 'Unauthorized',
        code: 4001
    }
})

export const DEFAULT_PORT = 8642;

export const PACKET_OPCODES = Object.freeze({
    0: 'info',
    1: 'fatal',
    2: 'command',
    3: 'offload',
    4: 'shutdown',
    5: 'initialise',
    info: 0,
    fatal: 1,
    command: 2,
    offload: 3,
    shutdown: 4,
    initialise: 5
})

export enum SocketServerStates {
    ESTABLISHING,
    AWAITING_CLIENTS,
    ACTIVE,
    CLOSING,
    CLOSED
}