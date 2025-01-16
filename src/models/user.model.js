import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrpt from "bcrypt"



const userSchema = new Schema(
    {
        username:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true

        },
        email:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName:{
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar:{
            type:String,
            required:true,
        },
        coverImage:{
            type: String
        },
        watchHistory:[
            {
                type: Schema.Types.ObjectId,
                ref:"video"
            }
        ],
        password:{
            type:String,
            required:[true,'password is required']
        },
        refreshToken:{
            type: String
        }

},{timestamps:true})

 // in this function i encrypting the password
//"save" is a event  "next" is a flag to pass middleware
userSchema.pre("save", async function(next){  // .pre is a middleware methods which is use perform event before saving the Data
    if(!this.isModified("password")) // when userschema password feidl is not modifiy 
    {
        return next();
    }
    this.password = await bcrpt.hash(this.password,10); //this.password is present in Database 
    next()
})


//".methods help to write a customize methods"
userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrpt.compare(password,this.password) // here this.password is Database password and password which input by user
    
}


//basiclly jwt is a key which secure the website 
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(  // .sign method use to generate jwt which have three parameters
        {                 
            _id: this._id,
            email:this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken= function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema)