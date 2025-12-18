import Task from "../models/Task.js";
import mongoose from "mongoose";

// @desc    Create new task
// @route   POST /api/v1/tasks
// @access  Private

const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, duedate} = req.body

    // Ensure the title field is provided 
    if (!title || !description) {
      return res.status(400).json({ success: false, error: "Task title and description are mandatory", })
    }

    // gettin user's ID from payload
    const userId = req.user.id
    //  console.log('User ID from token:', req.user.id);

    let completed = false;
    let completedAt = null;
    
    if (status === "completed") {
      completed = true;
      completedAt = new Date();
    }
    // Create a new task
    const task = await Task.create({
      title,
      description,
      status: status || "pending",
      priority: priority || "medium",
      duedate,
      completed,    
      completedAt,  
      user: userId
    });

    return res.status(201).json({ success: true, message: "Task created successfully", data: task })

  } catch (err) {
    console.error("Error creating user's tasks:", err);
    return res.status(500).json({ success: false, error: "Failed to create user's tasks" });
  }
}


// NOTE: Query Filtering (Searching) --- do not do this in PUT/PATCH

// @desc    Get all user tasks with filtering, search, and sorting
// @route   GET /api/v1/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, priority, completed, search, sortBy, order, page = 1, limit = 10 } = req.query;

    // Build the Filter Object with security: Only the logged-in user's non-deleted tasks
    const queryObj = { user: userId, isDeleted: false };

    // Strict Filtering
    if (status) queryObj.status = status;
    if (priority) queryObj.priority = priority;
    if (completed !== undefined) queryObj.completed = completed === "true";

    // Text Search Logic (Title or Description)
    if (search) {
      queryObj.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

   const field = sortBy || 'createdAt';
   const sortStr = order === 'desc' ? `-${field}` : field;

    // Pagination Logic
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const tasks = await Task.find(queryObj)
      .sort(sortStr)
      .skip(skip)
      .limit(limitNum);

    const total = await Task.countDocuments(queryObj);

    res.status(200).json({
      success: true,
      count: tasks.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
      data: tasks,
    });
  } catch (err) {
    console.error("Error getting user's tasks:", err);
    return res.status(500).json({ error: "Failed to get user's tasks" });
  }
};

// @desc    Get single task
// @route   GET /api/v1/tasks/:id
// @access  Private

const getTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    // console.log("Requested Task ID:", taskId);
    const userId = req.user.id;
    // console.log("User ID from token:", userId);

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ error: "Invalid task ID format" })
    }

const task = await Task.findOne({_id : taskId, user: userId, isDeleted: false });  

if (!task) {
      return res.status(404).json({ error: "Task not found " })
    }

    res.status(200).json({ success: true, data: task })

  } catch (err) {
    console.error("Error getting user's task:", err);
    return res.status(500).json({ error: "Failed to get user's task" });
  }

}


// @desc    Update task (Universal Whitelisting- Input filtering)
// @route   PUT /api/v1/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ error: "Invalid task ID format" });
    }

    const { title, description, priority, status, duedate } = req.body;
    const updates = {};
    
    const validPriorities = ["low", "medium", "high"];
    const validStatuses = ["pending", "in-progress", "completed"];

    // Apply updates only if they exist and are valid
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (priority && validPriorities.includes(priority)) {
      updates.priority = priority;
    }
    if (status && validStatuses.includes(status)) {
      updates.status = status;
      updates.lastStatusChange = new Date();

      // Sync boolean and completion date
      if (status === "completed") {
        updates.completed = true;
        updates.completedAt = new Date();
      } else {
        // This handles "pending" or "in-progress"
        updates.completed = false;
        updates.completedAt = null;
      }
    }

    if (duedate !== undefined) updates.duedate = duedate;

    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, user: userId }, 
      { $set: updates }, 
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found or not authorized to edit" });
    }

    res.status(200).json({ 
      success: true, 
      message: "Task updated successfully", 
      data: updatedTask 
    });

  } catch (err) {
    console.error("Update error:", err);
    return res.status(500).json({ error: "Internal server error during update" });
  }
};


// @desc    Delete task - Soft delete (trash can feature)
// @route   DELETE /api/v1/tasks/:id
// @access  Private

const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ error: "Invalid task ID format" })
    }

    const task = await Task.findOneAndUpdate({ _id: taskId, user: userId, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ error: "Task not found or deleted" })
    }

    return res.status(200).json({ success: true, message: "Task moved to trash successfully" })
  } catch (err) {
    console.error("Error deleting user's tasks: ", err);
    return res.status(500).json({ error: "Failed to delete user's tasks" })
  }
}


// @desc    Restore soft-deleted task
// @route   PATCH /api/v1/tasks/:id/restore
// @access  Private
const restoreTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ error: "Invalid task ID format" })
    }

    const task = await Task.findOneAndUpdate(
      { _id: taskId, user: userId, isDeleted: true },
      { $set: { isDeleted: false, deletedAt: null } },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ error: "Task not found in trash" })
    }

    return res.status(200).json({ 
      success: true, 
      message: "Task restored successfully",
      data: task
    })
  } catch (err) {
    console.error("Error restoring task: ", err);
    return res.status(500).json({ error: "Failed to restore task" })
  }
}

// @desc    Get all deleted tasks (trash)
// @route   GET /api/v1/tasks/trash
// @access  Private
const getDeletedTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const tasks = await Task.find({ user: userId, isDeleted: true })
      .sort('-deletedAt')
      .skip(skip)
      .limit(limitNum);

    const total = await Task.countDocuments({ user: userId, isDeleted: true });

    res.status(200).json({
      success: true,
      count: tasks.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
      data: tasks,
    });
  } catch (err) {
    console.error("Error getting deleted tasks:", err);
    return res.status(500).json({ error: "Failed to get deleted tasks" });
  }
};

// @desc    Permanently delete task
// @route   DELETE /api/v1/tasks/:id/permanent
// @access  Private
const permanentDeleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ error: "Invalid task ID format" })
    }

    const task = await Task.findOneAndDelete({ 
      _id: taskId, 
      user: userId, 
      isDeleted: true 
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found in trash" })
    }

    return res.status(200).json({ 
      success: true, 
      message: "Task permanently deleted" 
    })
  } catch (err) {
    console.error("Error permanently deleting task: ", err);
    return res.status(500).json({ error: "Failed to permanently delete task" })
  }
}


export { createTask, getTasks, getTask, updateTask, deleteTask, restoreTask, getDeletedTasks, permanentDeleteTask  };