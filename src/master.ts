import { EventEmitter } from 'events';

import { DEFAULT_PORT } from './constants';
import { SocketServer } from './socketserver';

export interface MasterServerOptions {
    /**
     * The port to listen on. Defaults to 8642.
     */
    port?: number
}

export interface Master {
    on(event: 'controlConnect', listener: (code: number, reason: string) => void): this;
}

/**
 * The MASTER server which handles all communication with control servers.
 * @prop port The port this server listens on
 * @prop token The token to authenticate with
 */
export class MasterServer extends EventEmitter {
    readonly port: number;
    readonly token: string;

    public socketServer: SocketServer = new SocketServer(this);

    /**
    * Creates a new MasterServer instance.
    * Refer to {@link https://github.com/discluster/master/README.md the README} for basic operation.
    * @arg token The bot token that this system will authenticate with.
    * @arg options all optional arguments
    */
    constructor(token: string, options: MasterServerOptions) {
        super();
        this.port = options.port || DEFAULT_PORT;
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