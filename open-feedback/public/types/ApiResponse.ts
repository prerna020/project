import { Message } from "../models/User";

export interface ApiResponse{
    sucess: boolean,
    message: string,
    isAcceptingMessages?: boolean,
    messages?: Message[]
}