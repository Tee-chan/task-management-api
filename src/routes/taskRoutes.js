import express from "express";
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  restoreTask, 
  getDeletedTasks, 
  permanentDeleteTask
} from "../controllers/taskController.js";
import { verifyUserToken } from "../middleware/auth.js";

const router = express.Router();

//NOTE: static routes should be defined before dynamic routes to prevent conflicts

router.get("/trash", verifyUserToken, getDeletedTasks);

router.route("/")
.post(verifyUserToken, createTask)
.get(verifyUserToken, getTasks);

router.route("/:id")
  .get(verifyUserToken, getTask)     
  .put(verifyUserToken, updateTask)    
  .delete(verifyUserToken, deleteTask); 

  router.patch('/:id/restore', verifyUserToken, restoreTask);
  router.delete('/:id/permanent', verifyUserToken, permanentDeleteTask);



export default router;

