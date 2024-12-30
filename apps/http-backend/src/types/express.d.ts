import { User } from '../config/types';

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
} 