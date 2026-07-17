import express from "express";  
import cors from "cors";    
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDb } from "./src/utils/db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/v1/health",(req,res) => {
    res.status(200).json({message: "Server is running"});
})
// import connectDB from "./src/utils/db.js";
 



// start the server only when db is connected
connectDb().then(() => {
  app.listen(process.env.PORT || 8080, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
});

