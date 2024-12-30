import dotenv from "dotenv";

dotenv.config({ path: './env' });

export const ENV = {
    JWT_SECRET : process.env.JWT_SECRET || "secret123",
    PORT : process.env.PORT || 5000,
    NODE_ENV : process.env.NODE_ENV || "development",
    REDIS_URL: process.env.REDIS_URL || ""
}
