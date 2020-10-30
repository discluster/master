export const DEFAULT_PORT = 8642;

export enum SocketServerStates {
    ESTABLISHING,
    AWAITING_CLIENTS,
    ACTIVE,
    CLOSING,
    CLOSED
}

export enum CLOSE_CODES {
    UNAUTHORIZED = 401
}