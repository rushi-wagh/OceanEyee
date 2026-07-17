import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

const connectDb = async () => {
  try {
    await prisma.$connect();
    console.log("Successfully connected to PostgreSQL😊");
  } catch (error) {
    console.error("Error connecting to PostgreSQL:", error);
  }
};



export { prisma, connectDb };
