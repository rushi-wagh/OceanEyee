import dotenv from "dotenv";
import { OpenAI } from "openai";

dotenv.config();

const API_KEY = process.env.OPENROUTER_API_KEY;

const BASE_URL = process.env.BASE_URL

export const client = new OpenAI({
  baseURL: BASE_URL,
  apiKey: API_KEY,
})