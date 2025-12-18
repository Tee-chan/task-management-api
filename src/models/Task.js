import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a task title"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
      trim: true,
      lowercase: true
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      trim: true,
      lowercase: true
    },
    lastStatusChange: {
      type: Date,
      default: Date.now,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
},
    deletedAt: {
      type: Date,
      default: null,
    },
    duedate: {
      type: Date,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ user: 1, completed: 1, priority: 1 });
taskSchema.index({ user: 1, isDeleted: 1 });
taskSchema.index({ user: 1, status: 1 });

export default mongoose.model("Task", taskSchema);
