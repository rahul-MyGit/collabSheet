import { ApiResponse } from "@/lib/ApiResponse";
import {Request, Response} from "express";

export const getAllDocument = (req: Request, res: Response) => {
    try {
        
    } catch (error) {
        ApiResponse(res, 500, false, "Internal server error");
    }
}