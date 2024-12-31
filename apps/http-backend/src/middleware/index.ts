import prisma from "@/db";
import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "@/lib/ApiResponse";
import jwt from "jsonwebtoken";
import { ENV } from "@/config";

export default async function protectRoute(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.token;
  
  if (!token) return ApiResponse(res, 401, false, 'Not authenticated');

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as { userId: string }; 
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) return ApiResponse(res, 401, false, 'User not found');

    req.userId = user.id;
    next();
  } catch (error) {
    res.clearCookie('token');
    res.status(401).json({ error: 'Invalid token' });
  }
}