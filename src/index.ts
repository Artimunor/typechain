import cluster from "cluster";
import { Log, LOG_LEVEL } from "./utils/log";
import { Server } from "./network/server"
import { Node } from "./network/node"
import { Chain } from "./blockchain/chain"
import { Miner } from "./blockchain/miner"

Log.level = LOG_LEVEL.ALL;

const tag: string = "Main";
const host: string = "localhost";
const port: number = Number(process.env.PORT) || 8090;
const discoveryPort = 8090
const chain : Chain = new Chain();
const nodes : Node[] = [];
const difficulty : number = 4;
const server : Server = new Server(host, port, chain);

if (cluster.isMaster) {

    Log.info(tag, "Master process started with pid", process.pid);
    const mineWorker = cluster.fork({alias: "mineworker"})

    mineWorker.on("message", (newBlock) => {
        chain.addBlock(newBlock);
        server.pushBlocks();
        Miner.requestBlockData(difficulty, chain, mineWorker);
    });

    cluster.on("online", (worker) => {
        if (worker == mineWorker) {
            Miner.requestBlockData(difficulty, chain, mineWorker);
        }
    });

} else {

    Log.info(tag, "Worker process started with pid", process.pid, "and alias", `'${process.env.alias}'`);
    if (process.env.alias === "mineworker") {
        Miner.mineEvents();
    }
}