import express from "express";  
import cors from "cors";    
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDb } from "./src/utils/db.js";
import authRouter from "./src/routes/auth.route.js";
import { errorHandler } from "./src/middlewares/error.middleware.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/v1/health",(req,res) => {
    res.status(200).json({message: "Server is running"});
})

app.use("/api/auth", authRouter);

app.use(errorHandler);
 



// start the server only when db is connected
connectDb().then(() => {
  app.listen(process.env.PORT || 8080, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
});

