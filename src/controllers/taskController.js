import Task from "../models/Task.js";

// @desc    Create new task
// @route   POST /api/v1/tasks
// @access  Private

const createTask = async (req, res) =>{
    try{
        const {title, description, status , priority, dueDate, tags} = req.body

        // Ensure the title field is provided 
        if (!title || !description){
            return res.status(401).json({success: "false", error: "Task title and description are mandatory", })
        }

        // gettin user's ID from payload
        const user =  req.user.id
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
        
    return res.status(201).json({success: true, message: "Task created successfully", data: task})

} catch(err){      
    console.error("Error creating user's tasks:", err);
    return res.status(500).json({ error: "Failed to get user's tasks" });
    }
}


// @desc    Get all tasks for logged-in user
// @route   GET /api/v1/tasks
// @access  Private

const getTasks = (req, res) =>{

}

// @desc    Get single task
// @route   GET /api/v1/tasks/:id
// @access  Private

const getTask = (req, res) =>{
    
}

// @desc    Update task
// @route   PUT /api/v1/tasks/:id
// @access  Private

const updateTask = (req, res) =>{
    
}

// @desc    Delete task
// @route   DELETE /api/v1/tasks/:id
// @access  Private

const deleteTask = (req, res) =>{
    
}

// @desc    Toggle task completion
// @route   PATCH /api/v1/tasks/:id/complete
// @access  Private


export {createTask}