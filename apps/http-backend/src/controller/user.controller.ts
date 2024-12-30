import { ENV } from '@/config';
import { signinSchema, signupSchema } from '@/config/zod';
import prisma from '@/db/index'
import { ApiResponse } from '@/lib/ApiResponse';
import { Request, Response  } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { cookieConfig } from '@/config/cookie';

export const signup = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = signupSchema.parse(req.body);

        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] }
        });

        if (existingUser) return ApiResponse(res, 400, false, 'Email or username already exists')

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { username, email, password: hashedPassword }
        });

        const token = jwt.sign({ userId: user.id }, ENV.JWT_SECRET);
        res.cookie('auth_token', token, cookieConfig);
        res.json({ message: 'Signup successful' });
        return;
    } catch (error) {
        ApiResponse(res, 400, false, 'Invalid input');
        return;
    }
}

export const signin = async (req: Request, res: Response) => {
    try {
        const { email, password } = signinSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return ApiResponse(res, 401, false, 'Invalid credentials')

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return ApiResponse(res, 401, false, 'Invalid credentials')

        const token = jwt.sign({ userId: user.id }, ENV.JWT_SECRET);
        res.cookie('auth_token', token, cookieConfig);
        res.json({ message: 'Login successful' });
    } catch (error) {
        return ApiResponse(res, 400, false, 'Invalid input');
    }
}

export const logout = (req: Request, res: Response) => {
    res.clearCookie('auth_token');
    res.json({ message: 'Logged out successfully' });
}

export const getMe = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId }
        });

        res.status(200).json({
            id: user?.id,
            name: user?.username,
            email: user?.email
        });
        return;

    } catch (error) {
        ApiResponse(res, 404, false, "Server Error")
    }
}