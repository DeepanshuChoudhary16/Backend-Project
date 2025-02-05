import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudnary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessTokenAndRefreshTokens = async(userId)=>
{
    try {
        const user = await User.findById(userId)
        const accessToken =user.generateAccessToken()// calling geratedAccess token which is present in user model
        const refereshToken =user.generateRefreshToken()// calling Refresh token which is present in user model

        user.refereshToken = refereshToken
        await user.save({ validateBeforeSave: false }) // user.save use to save the change and validate before save use to prevent to kickin other feild of user model

        return {accessToken,refereshToken}


    } catch (error) {
        throw new ApiError(500 , "Something is wrong while generating refresh and access token")
        
    }
}
const registerUser = asyncHandler(async(req,res) =>{
    //step for registation of the user
    // get details from frontend or postman as follow usermodel
    // validation - not empty
    // check if user already exists : username , email
    //check for images , check for avatar
    //upload them to cloudinary , avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response 


//step 1-details 
    const {fullName , email , username , password } =req.body
    console.log("email: ",email );

// validation
    if([fullName , email , username , password].some((field) => field?.trim() ===""))
    {
        throw new ApiError(400,"All feild are required")
    }
//check user is exist or not
    const existUser = await User.findOne({
        $or:[{username} , {email}]
    })
    
    if(existUser)
    {
        throw new ApiError(409 , "Email or Username already exists")
    }

    // check cover image and avatar where avatar is compulsary

    console.log(req.files);// return a array of avatar and cover image in form of object

    const avatarLocalPath = req.files?.avatar[0]?.path
    console.log("avatar Path:", avatarLocalPath);
    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    // console.log("coverImage Path:", coverImageLocalPath);
    
    // 2nd method 
    let coverImageLocalPath ;
    if(req.files && Array.isArray(req.file) && req.files.coverImage >0)
    {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    
    if(!avatarLocalPath)
    {
        throw new ApiError(400,"Avatar file is required");
    }

// Upload on Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar)
        {
            throw new ApiError(400,"Avatar file is required on cloudinary");
        }

// creater user object
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser)
    {
        throw new ApiError(500,"Something going wrong while creating User")
    }
    
//return response
    return res.status(201).json(
        new ApiResponse(200 , createdUser , "User register successfully")
    )

})

    // req data -> data
    //username or email
    //find the user
    //password check
    // access and referesh token
    // send cookie

    const loginUser = asyncHandler(async (req, res) =>{
        // req body -> data
        // username or email
        //find the user
        //password check
        //access and referesh token
        //send cookie
    
        const {email, username, password} = req.body
        console.log(email);
    
        if (!username && !email) {
            throw new ApiError(400, "username or email is required")
        }
        
        // Here is an alternative of above code based on logic discussed in video:
        // if (!(username || email)) {
        //     throw new ApiError(400, "username or email is required")
            
        // }
    
        const user = await User.findOne({
            $or: [{username}, {email}]
        })
    
        if (!user) {
            throw new ApiError(404, "User does not exist")
        }
    
       const isPasswordValid = await user.isPasswordCorrect(password)
    
       if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
        }
    
       const {accessToken, refreshToken} = await generateAccessTokenAndRefreshTokens(user._id)
    
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )
    
    })

const logoutUser = asyncHandler(async(req,res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },{
            new: true
        }
    )

    const option ={ // putting the information in cookies
        httpOnly: true,
        secure: true
    
    }

    return res
    .status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(new ApiResponse(200,{},"User logged Out"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refereshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
                incomingRefreshToken,
                process.env.REFRESH_TOKEN_SECRET
            )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"unauthorizes request")
        }
    
        if(incomingRefreshToken !== user?.refreshToken)
        {
            throw new ApiError(401,"refresh token is expired or use")
        }
    
        const option={
            httpOnly:true,
            secure: true
        }
    
        const {accessToken,newrefreshToken}=await generateRefreshToken(user._id)
       
        return res
        .status(200)
        .cookie("accessToken",accessToken,option)
        .cookie("refreshToken",newrefreshToken,option)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newrefreshToken},
                "Access token refreshed"
            )
        )
    
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token")
        
    }

})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = user.isPasswordCorrect(oldPassword)
    isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect)
    {
        throw new ApiError(400,"Invalid old password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password change"))
}
)

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(200,req.user,"current user fetched successfully")
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName,email}=req.body

    if(!fullName || !email)
    {
        throw new ApiError(400,"All field are required")

    }

    const user =User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details updated successfully"))

})

const UpdateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath)
    {
        throw new ApiError(400,"Avatar file is missing")

    }
    if(!avatar.url){
        throw new ApiError(400,"Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id
        ,{
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user ,"Avatar uploaded  ")
    )

})

const UpdateUserCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath)
    {
        throw new ApiError(400,"Cover Image file is missing")

    }
    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading on coverImage")
    }

   const user = await User.findByIdAndUpdate(
        req.user?._id
        ,{
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user ,"cover image uploaded  ")
    )

})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    updateAccountDetails,
    getCurrentUser,
    UpdateUserAvatar,
    UpdateUserCoverImage
};