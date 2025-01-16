import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

// we use 'app.use' when we need middleware  
app.use(cors({  
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit:"16kb"})) // when data come from form
app.use(express.urlencoded({extended:true , limit:"16kb"}))// when data come from URL
app.use(express.static("public"))
app.use(cookieParser())


// routes import 

import userRouter from './routers/user.routers.js';

// routes declaration
// we declare routes as middleware by using "use."
app.use("/api/v1/users", userRouter)
                        // raha s ham routers pr jayege 
//exmpale of req -> http://localhost:8000/api/v1/users/register



export  {app}