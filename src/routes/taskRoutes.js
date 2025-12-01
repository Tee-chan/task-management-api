import express from "express";
import {
  createTask,
//   getTasks,
//   getTask,
//   updateTask,
//   deleteTask,
//   toggleTaskCompletion,
} from "../controllers/taskController.js";
import { verifyUserToken } from "../middleware/auth.js";

const router = express.Router();

// POST /api/v1/tasks  Create new task 
// GET /api/v1/tasks Get all user tasks 
// GET /api/v1/tasks/:id  Get single task 
// PUT /api/v1/tasks/:id Update task 
// DELETE /api/v1/tasks/:id Delete task 
// PATCH /api/v1/tasks/:id/complete Toggle task completion 

router.route("/")
.post(verifyUserToken, createTask)
//   .get(getTasks);  

// router.route("/:id")
//   .get(getTask)     
//   .put(updateTask)    
//   .delete(deleteTask); 

// Toggle completion
// router.patch("/:id/complete", toggleTaskCompletion); 

export default router;