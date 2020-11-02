import { EventEmitter } from 'events';

import { DEFAULT_PORT } from './constants';
import { SocketServer } from './socketserver';

export interface MasterServerOptions {
    /**
     * The authorization header CONTROL servers must send in order to connect. Strongly recommended.
     */
    authorization?: string
    /**
     * The interval at which CONTROL servers must heartbeat to MASTER in order to stay connected.
     */
    heartbeatInterval?: number
    /**
     * The port to listen on. Defaults to 8642.
     */
    port?: number
}

export interface MasterServer {
    on(event: 'controlConnect', listener: (code: number, reason: string) => void): this;
}

/**
 * The MASTER server which handles all communication with control servers.
 * @prop port The port this server listens on
 * @prop token The token to authenticate with
 */
export class MasterServer extends EventEmitter {
    readonly authorization?: string;
    readonly port: number;
    readonly token: string;

    public socketServer: SocketServer;

    /**
    * Creates a new MasterServer instance.
    * Refer to {@link https://github.com/discluster/master/README.md the README} for basic operation.
    * @arg token The bot token that this system will authenticate with.
    * @arg options all optional arguments
    */
    constructor(token: string, options: MasterServerOptions) {
        super();
        this.authorization = options.authorization;
        this.port = options.port || DEFAULT_PORT;
        this.socketServer = new SocketServer(this, options.heartbeatInterval || 25000);
        this.token = token;
    }

    /**
     * Initialises this MASTER server.
     * Basic procedure: Start the WebSocket server, and await connections from CONTROL processes for 1 minute.
     * Then, send signals to each CONTROL server to begin spawning clusters. Finally, send signals to connect those clusters.
     * {@link https://github.com/discluster/master/README.md The README} holds more detailed information.
     */
    public async initialise() {

    }
}