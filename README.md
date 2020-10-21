# MASTER

This is the repository for the MASTER server for a Discluster system. It contains the raw TypeScript code for it, as well as outlining the protocol used for communication with CONTROL processes.

## Basic Mechanism

When the MASTER server is started, it will await connections from CONTROL processes. CONTROL processes will attempt to connect to the MASTER server every 30 seconds if they are not connected.<br>
MASTER will send an acknowledgement packet back to the CONTROL processes to indicate that they should wait for further instructions.<br>
Subsequently, the MASTER will wait 45 seconds before assuming all CONTROL processes are connected and proceed to initialise the CONTROL processes.

### Initialisation

The first thing MASTER will do is fetch the [recommended amount of shards for this bot from the Discord REST API](https://discord.com/developers/docs/topics/gateway#get-gateway-bot).<br>
MASTER will use this number to calculate how many shards should be distributed to each machine.

MASTER will calculate how many shards to allocate to each machine based on how many machines there are, as well as the current 15-minute load-average for each machine, as well as the amount of CPU cores available on each machine.<br>
MASTER will request this information from each CONTROL process and use the following formula to produce a ratio that determines how many shards to assign:<br>
`Core Count / Load Avg`

The MASTER server will then send the shard count for each CONTROL back to the respective processes. The CONTROL is then responsible for the initialisation of clusters. More on this in the CONTROL repository.

### Operation

Under normal operation, MASTER only has a limited amount of roles. One main role is to keep track of currently operating CONTROL processes and monitor them in case one fails.<br>
If this happens, MASTER will automatically offload the shards managed by that CONTROL to other currently functioning CONTROL processes (provided they exist).<br>
CONTROL processes may still operate if the MASTER server is down, but the system may become unstable if left offline for too long because dead clusters will not be moved to a different machine.

MASTER also supports redundant machines, which essentially act as standby in case an active machine fails for any reason. If that happens, the shards allocated that machine will be re-allocated to one of the standby machines. This will minimise the amount of downtime guilds served by those shards will experience.