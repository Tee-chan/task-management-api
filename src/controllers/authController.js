
import { comparePassword } from "../middleware/bcrypt.js";
import { signJwt } from "../middleware/auth.js";
import User from "../models/User.js";
import rateLimit from "express-rate-limit";

// @decription: Register a user
// @route POST /api/auth/register
// @access Public

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Ensure all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are Mandatory" });
    }

    // Check if email is already in use
    const userAvailable = await User.findOne({ email });
    if (userAvailable) {
      return res.status(400).json({ error: "User is already registered!" });
    }

    // Create the new user
    const user = await User.create(req.body);
    // log(`User is created successfully: ${user}`);

   // Generate JWT token
    const token = signJwt({
      id: user._id.toString(),
      email: user.email,
    });
    // console.log("Generated token:", token);

    // Send a response without sending sensitive info like password
    if (user) {
      return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
                } },
    });
    } else {
      return res.status(400).json({ error: "User data is not valid!" });
    }
  } catch (err) {
    console.error("Error registering user:", err);
    return res.status(500).json({ error: "Failed to register user" });
  }
};

// @decription: Login a user
// @route POST /api/auth/login
// @access Public
const loginUser = async (req, res) => {
  console.time('login duration')
  try {
    // Required fields from request body
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ error: "All fields are Mandatory!!" });
    }

    // Find user by email with password selection
    console.time('db_query');
    const user = await User.findOne({ email }).select('+password');

    // If user not found, return error
    if (!user) {
      return res
        .status(400)
        .json({ error: "Invalid credentials: user not found" });
    }
      // console.log(`User is logged in successfully:" ${user.password}`);
      // console.log(`User is logged in successfully:" ${password}`);

  // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false,
        error: "Account is deactivated" 
      });
    }
      console.timeEnd('db_query');


        console.time('password_compare');
    // Compare password
    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ error: "Invalid credentials: wrong password" });
    }
         console.timeEnd('password_compare');

    // Create JWT access token
    const generateAccessToken = signJwt({
      id: user._id.toString(),
      email: user.email,
    });

    // Exclude sensitive data like password from the user object in mongoose doc
    // const {
    //   _doc: { password: hash, ...rest },
    // } = user;

      const userResponse = user.toObject();
      delete userResponse.password;

    console.timeEnd('login duration')

    // Send response
    res.status(200).json({
      message: "Login successful",
      statusCode: 200,
      data: { generateAccessToken, user: userResponse },
    });
  } catch (err) {
    console.error("Error logging user:", err);
    console.timeEnd('login duration')

    res
      .status(500)
  }
};

// Rate Limiter for Auth - max 10 requests per hour per IP
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 10, 
  message: {
    error: "Too many login attempts. Please try again in an hour."
  }
});

export {registerUser, loginUser, authLimiter } ;