import dotenv from "dotenv"
import connectDB from "./db/index.js"
import {app} from "./app.js"

dotenv.config({  // load env variable an put on the top on the code
    path:'./.env'
})

connectDB() 
.then(()=>{
    app.listen(process.env.PORT || 8000 ,() =>{
        console.log(`server is running on : ${process.env.PORT}`);
    })
    app.on("error",(error)=>{
        console.log("ERROR: ",error);
        throw error;
    })
})
.catch((error)=>{
    console.log("Database is fail to connect", error);
})











/*
import express from "express"
const app = express()


;(async() => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("err: ",error);
            throw error
        })

        app.listen(process.env.PORT,() => {
            console.log(`app is listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("ERROR:",error)
        throw err
        
    }

})()
    */