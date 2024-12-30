import dotenv from "dotenv";

dotenv.config({ path: './env' });

export const ENV = {
    JWT_SECRET : process.env.JWT_SECRET || "secret123",
    PORT : process.env.PORT || 6969,
    NODE_ENV : process.env.NODE_ENV || "development"

}