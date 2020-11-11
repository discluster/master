# WebSocket Communication

This file provides a detailed breakdown on the exact communication procedures between CONTROL and MASTER servers, including the connection process and how communication happens under normal operation.

## Opening a connection

CONTROL servers can connect to MASTER at any point after the MASTER server starts accepting connections.<br>
MASTER servers can, and should, have an `Authorization` key that needs to be sent as a header by every connecting CONTROL server. If the key is invalid or not supplied, the socket will be immediately be closed with close code 401 (Unauthorized).

After establishing the initial connection, the MASTER server will send back an acknowledgement packet indicating the connection was successful.<br>
This packet will conain the following information:

    - The interval at which the CONTROL server should heartbeat to MASTER. (More on heartbeating below)
    - The Discord bot token the CONTROL server's clusters should use.
    - The total shard count of this system.

The exact form of this data is detailed in the documentation (soon).<br>
This packet marks the end of connection-triggered communication between MASTER and CONTROL.

## Sustaining a connection

### Heartbeats

Connections are sustained through the use of heartbeating. The heartbeat interval to use is defined as an option in MASTER and it defaults to one every 30 seconds.<br>
When a CONTROL server sends a heartbeat packet, MASTER will recieve it and update the most recent heartbeat time for that socket. MASTER will then send back an acknowledgement packet.<br>
If MASTER detects that a CONTROL server has not sent a heartbeat in longer than roughly 15 seconds beyond the heartbeat interval, it will assume that the CONTROL server has died in which case it will begin offloading the clusters on that server to a different server or servers.

### Disconnections and zombified sockets

There is a chance that a CONTROL server will disconnect from MASTER just due to transient bugs in transit. In which case, CONTROL may re-attempt to connect to MASTER with a different connection packet that contains information on what shard range it is serving so that MASTER may identify it. However, if no connection is attempted in 30 seconds, MASTER will begin the cluster offloading procedure.

Zombified sockets refer to CONTROL servers that are connected to MASTER but do not send packets to MASTER. In such cases, the socket will be closed with close code 4001 (Dead connection).

## Additional Communication

### Connecting a CONTROL's clusters

After 45 seconds have passed, the MASTER server will begin sending a packet to each CONTROL server in turn.<br>
This packet will signal that the CONTROL server should connect its clusters to the Discord gateway. Immediately after recieving the packet, CONTROL will send back a packet indicating it has started connecting its clusters.<br>
The packet contains the following information:

    - The range of shards that this CONTROL server should serve with its clusters.
    - Whether this CONTROL server is redundant.

The CONTROL server will then spawn clusters and connect their shards to the Discord gateway before sending a packet back indicating that it is done. Only then will the MASTER server instruct the next CONTROL server to initialise its clusters.