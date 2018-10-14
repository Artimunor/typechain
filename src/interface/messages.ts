export interface MineRequest {
    type : string;
    index : number;
    difficulty : number;
    data : string;
    previousHash : string;
}

export interface MineResponse {
    resolved: boolean;
    index? : number;
    nonce? : number;
    data? : string;
    hash? : string;
    previousHash? : string;
}