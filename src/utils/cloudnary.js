import {v2 as cloudinary} from "cloudinary";
import fs from 'fs' // file system -> to manage file system

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
});
    
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath)
        {
            return null;
        }
        const response =  await cloudinary.uploader.upload(localFilePath,{
            public_id:"auto"
        } )
        // file has been uploaded successfull
        console.log("file success fully upload on cloudinary: ",response.url);
        return response
        

    } catch (error) {
        
        fs.unlinkSync(localFilePath) // remove the locally saved tempoarary file as the upload operation got failes
        return null;
    }
    
}
 export {uploadOnCloudinary}
    
