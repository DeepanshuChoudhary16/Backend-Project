import { Router } from "express";
import {logoutUser,loginUser,registerUser} from "../controllers/user.controllers.js"
import {upload} from "../middlerwares/multer.middlerwares.js"
import{verifyJWT} from "../middlerwares/auth.middleware.js"
const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }

    ]),
    registerUser)

router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(verifyJWT ,logoutUser)

export default router