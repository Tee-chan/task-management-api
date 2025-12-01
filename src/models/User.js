import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide Fullname "],
      minlength: [7, "Full name cannot be less than 7 characters"],
      maxlength: [30, "Fullname cannot be more than 30 characters"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "please provide an email address"],
      unique: [true, "the user email is already taken"],
      lowercase: true,
      trim:true,
      match: [
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please provide a valid email"
      ]
    },
    password: {
      type: String,
      required: [true, "please provide a password"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false, // Don't return password by default in queries

    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      const hashedPassword = await bcrypt.hash(this.password, 10);
      this.password = hashedPassword;
    }
    next();
  } catch (err) {
    next(err);
  }

// compare pwd for login
  userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
});

export default mongoose.model("User", userSchema);