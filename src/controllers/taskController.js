import Task from "../models/Task.js";
import mongoose from "mongoose";

// @desc    Create new task
// @route   POST /api/v1/tasks
// @access  Private

const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, tags } = req.body

    // Ensure the title field is provided 
    if (!title || !description) {
      return res.status(401).json({ success: false, error: "Task title and description are mandatory", })
    }

    // gettin user's ID from payload
    const user = req.user.id
    //  console.log('User ID from token:', req.user.id);

    // Create a new task
    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      tags,
      user
    });

    return res.status(201).json({ success: true, message: "Task created successfully", data: task })

  } catch (err) {
    console.error("Error creating user's tasks:", err);
    return res.status(500).json({ success: false, error: "Failed to create user's tasks" });
  }
}

// @desc    Get all tasks for logged-in user
// @route   GET /api/v1/tasks
// @access  Private

const getTasks = async (req, res) => {
  try {
    const { status, priority, completed, search, sortBy, order } = req.query;

    const userId = req.user.id;
    let query = Task.find({ user: userId });

    if (status) {
      query = query.where('status').equals(status);
    }
    if (priority) {
      query = query.where('priority').equals(priority);
    }
    if (completed !== undefined) {
      query = query.where('completed').equals(completed === "true");
    }
    if (search) {
      query = query.or([
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]);
    }
    if (sortBy) {
      const sortOrder = order === 'desc' ? '-' : '';
      query = query.sort(`${sortOrder}${sortBy}`);
    } else {
      query = query.sort('-createdAt');
    }

    const tasks = await query;

    res.status(200).json({ success: true, count: tasks.length, data: tasks })
  } catch (err) {
    console.error("Error getting user's tasks:", err);
    return res.status(500).json({ error: "Failed to get user's tasks" });
  }

}

// @desc    Get single task
// @route   GET /api/v1/tasks/:id
// @access  Private

const getTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    // console.log("Requested Task ID:", taskId);
    const userId = req.user.id;
    // console.log("User ID from token:", userId);

    if(!mongoose.Types.ObjectId.isValid(taskId)){
      return res.status(400).json({error: "Invalid task ID format"})
    }

        const task = await Task.findById(taskId);
    if(!task || task.user.toString() !== userId){
      return res.status(404).json({error: "task not found "})
    }

    res.status(200).json({ success: true, data: task })

  } catch (err) {
    console.error("Error getting user's task:", err);
    return res.status(500).json({ error: "Failed to get user's task" });
  }

}

// @desc    Update task
// @route   PUT /api/v1/tasks/:id
// @access  Private

const updateTask = async (req, res) => {
  try{
    const taskId = req.params.id;
    const userId = req.user.id;
    const updateData = { $set: req.body };

    if(!mongoose.Types.ObjectId.isValid(taskId)){
      return res.status(400).json({error: "Invalid task ID format"})
    }

    const updatedTask = await Task.findOneAndUpdate( { _id: taskId, user: userId }, updateData, {new: true, runValidators: true } );

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found or not authorized" });
    }

    res.status(200).json({ success: true, message: "Task updated successfully", data: updatedTask })  
  }catch(err){
    console.error("Error updating user's task:", err);
    return res.status(500).json({ error: "Failed to update user's task" });
  }

}

// @desc    Delete task
// @route   DELETE /api/v1/tasks/:id
// @access  Private

const deleteTask = async(req, res) => {
  try{
    const taskId = req.params.id;
    const userId = req.user.id;

    if(!mongoose.Types.ObjectId.isValid(taskId)){
      return res.status(400).json({error: "Invalid task ID format"})
    }

    const task = await Task.findOneAndDelete({ _id: taskId, user: userId });

    if(!task || task.user.toString() !== userId){
      return res.status(404).json({error: "Task not found"})
    }   

    return res.status(200).json({success: true, message: "Task deleted successfully"})
  }catch(err){
    console.error("Error deleting user's tasks: ", err);
    return res.status(500).json({error : "Failed to delete user's tasks"})
  }
}

// @desc    Toggle task completion
// @route   PATCH /api/v1/tasks/:id/complete
// @access  Private




export { createTask, getTasks, getTask, updateTask, deleteTask }