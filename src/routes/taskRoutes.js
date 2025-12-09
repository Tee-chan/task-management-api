import express from "express";
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
//   toggleTaskCompletion,
} from "../controllers/taskController.js";
import { verifyUserToken } from "../middleware/auth.js";

const router = express.Router();

router.route("/")
.post(verifyUserToken, createTask)
.get(verifyUserToken, getTasks);  

router.route("/:id")
  .get(verifyUserToken, getTask)     
  .put(verifyUserToken, updateTask)    
  .delete(verifyUserToken, deleteTask); 

// router.patch("/:id/complete", toggleTaskCompletion); 

export default router;