

import express from "express";
import {registerUser, loginUser} from "../controllers/authController.js";
import { authLimiter } from "../controllers/authController.js";


const router = express.Router();

router.post("/register", authLimiter, registerUser)
router.post("/login", authLimiter, loginUser);


export default router;