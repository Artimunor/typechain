import Net from "net";
import { Log } from "../utils/log";
import { Chain } from "../blockchain/chain"

export class Node {

    private tag: string = "Node";
    private port: number = 0;
    private host: string = "";
    private client: Net.Socket;
    private chain: Chain;

    constructor(host: string, port: number, chain: Chain) { 
        this.host = host;
        this.port = port;
        this.chain = chain;
        this.client = Net.createConnection(this.port, this.host);
        this.nodeEvents(this.client);
    }

    public nodeEvents(client: Net.Socket) {

        client.on("error", (error) => {
            Log.error(this.tag, error.toString());
        });

        client.on("end", () => {
            Log.info(this.tag, "disconnected from server.");
        });

        client.on("connect", (socket: Net.Socket) => {
            Log.info(this.tag, "connected to server "+ this.host + ":" + this.port);
        });

        client.on("data", (data: string) => {
            Log.info(this.tag, "data received from server: " + data);
            var parts = data.toString().split("|");
            parts.forEach((part:string) => {
                if (part.length > 0) {
                    this.chain.addBlock(JSON.parse(part));
                }
            });
        });
    }
}