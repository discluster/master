# MASTER

This is the repository for the MASTER server for a Discluster system. It contains the raw TypeScript code for it, as well as outlining the protocol used for communication with CONTROL processes.

## Basic Mechanism

When the MASTER server is started, it will await connections from CONTROL processes. CONTROL processes will attempt to connect to the MASTER server every 30 seconds if they are not connected. All CONTROL processes must send an authorization header with the connection, if one is provided in MASTER configuration.<br>
MASTER will send an acknowledgement packet back to the CONTROL processes to indicate that they should wait for further instructions.<br>
Subsequently, the MASTER will wait 45 seconds before assuming all CONTROL processes are connected and proceed to instruct the CONTROL processes.

### MASTER Initialisation

The first thing MASTER will do is fetch the [recommended amount of shards for this bot from the Discord REST API](https://discord.com/developers/docs/topics/gateway#get-gateway-bot).<br>
MASTER will use this number to calculate how many shards should be distributed to each machine.

The MASTER server will then await conenctions from CONTROL servers for a maximum of 45 seconds. When a CONTROL server connects, it will send information about the IP it is connecting from, as well as some basic system information used for shard balancing calculations by MASTER. On a successful connection, MASTER will immediately send a packet to thr CONTROL server with the bot token, heartbeat interval, and total shard count of the **whole system**.

Once the 45 seconds is up, MASTER will then send a packet to each CONTROL in turn, and wait for a response packet before sending the packet to the next server. This packet indicates that the CONTROL server should spawn clusters and connect them to the Discord gateway, and as such it holds information regarding what shards it is handling in its clusters (or if it's redundant).

The initialisation of clusters is discussed in more detail in the CONTROL repository.

### Operation

Under normal operation, MASTER only has a limited amount of roles. One main role is to keep track of currently operating CONTROL processes and monitor them in case one fails.<br>
If this happens, MASTER will automatically offload the shards managed by that CONTROL to other currently functioning CONTROL processes (provided they exist).<br>
CONTROL processes may still operate if the MASTER server is down, but the system may become unstable if left offline for too long because dead clusters will not be moved to a different machine.

In the event that a cluster has a 'fatal' error (i.e. unrecoverable), it will be routed via CONTROL up to MASTER. Nearly all [gateway close codes](https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-close-event-codes) can simply be handled by resuming the connection. If the error occurs during connection, it's usually a sign of invalid intents or an invalid token. In either of those cases, MASTER will stop all execution in the entire system to prevent further invalid identification requests, which could result in a ban from the gateway. After doing so, MASTER will then throw an error.

MASTER also supports redundant machines, which essentially act as standby in case an active machine fails for any reason. If that happens, the shards allocated that machine will be re-allocated to one of the standby machines. This will minimise the amount of downtime guilds served by those shards will experience.