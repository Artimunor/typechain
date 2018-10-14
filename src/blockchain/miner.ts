import crypto from "crypto";
import cluster from "cluster";
import { Log } from "../utils/log";
import { Chain } from "./chain"
import { MineRequest, MineResponse } from "../interface/messages"

export class Miner {

    public static isMining : boolean = false;

    public static requestBlockData(difficulty: number, chain: Chain, miner: cluster.Worker) {
    
        if (chain.blockChain.length == 0) {
            miner.send({
                type: "START",
                index: 0,
                difficulty: difficulty,
                data: Chain.genesisData,
                previousBlockHash: "-"
            });
    
        } else {
    
            const previousBlock = chain.getLastBlock();
            miner.send({
                type: "START",
                index: previousBlock.index + 1,
                difficulty: difficulty,
                data: new Date().toLocaleString(),
                previousBlockHash: previousBlock.hash
            });
        }
    }

    public static mineEvents() {

        cluster.on("message", function(mineRequest: MineRequest) {

            if (mineRequest.type == "START") {

                Miner.mineBlock(mineRequest.index, mineRequest.difficulty, mineRequest.data, mineRequest.previousHash).then((mineResult: MineResponse) => {
                    (<any>process).send(mineResult);
                });

            } else if (mineRequest.type == "STOP") {
                Miner.isMining = false;
            }
        });
    }

    public static mineBlock(index: number, difficulty: number, data: string, previousHash: string) : Promise<MineResponse> {

        const tag: string = "Miner";
        let start: string = "";
        let hash: string = "";
        let nonce: number = 0;

        return new Promise<MineResponse>((resolve) => {

            for (let i = 0; i < difficulty; i++) {
                start += "0";
            }

            Log.info(tag, "Start with mining Block", index, "with difficulty", difficulty);
            this.isMining = true;
            
            do {
                hash = crypto.createHash("sha256").update(nonce + data + previousHash).digest("hex")
                Log.info(tag, hash);
                nonce++;
            } while (hash.substr(0, difficulty) != start && this.isMining)
            if (this.isMining) {
                this.isMining = false;
                resolve({resolved: true, index: index, nonce: nonce, data: data, previousHash: previousHash});
            } else {
                resolve({resolved: false});
            }
        });
    }
}
