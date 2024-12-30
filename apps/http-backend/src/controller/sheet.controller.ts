import { ApiResponse } from "@/lib/ApiResponse";
import {Request, Response} from "express";

export const getAllDocument = (req: Request, res: Response) => {
    try {
        
    } catch (error) {
        ApiResponse(res, 500, false, "Internal server error");
        return;
    }
}

export const createNewDocument = (req: Request, res: Response) => {
    try {
        
    } catch (error) {
        ApiResponse(res, 500, false, "Internal server error");
        return;
    }
}

export const getDocument = (req: Request, res: Response) => {
    try {
        
    } catch (error) {
        ApiResponse(res, 500, false, "Internal server error");
        return;
    }
}

export const deleteDocument = (req: Request, res: Response) => {
    try {
        
    } catch (error) {
        ApiResponse(res, 500, false, "Internal server error")
        return;
    }
}
