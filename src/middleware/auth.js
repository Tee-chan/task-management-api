import { log } from "console";
import jwt from "jsonwebtoken";

let JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("JWT_SECRET is not defined in environment variables.");
  process.exit(1); // Exit if the secret key is missing
}

// Sign/Create JWT Token
export const signJwt = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyUserToken = (req, res, next) => {
  let authHeader = req.headers.Authorization || req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json("no token, authorization denied");
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = {
        id: decoded.id || decoded._id,
        email: decoded.email
      };
      
      // log(decoded);
      // console.log('Middleware is running')

      return next();

    } catch (err) {
      console.error("Token verification error:", err.message);
      res.status(400).json({ message: "Token is not valid/expired" });
    }
  } else {
    return res.status(401).json("no token, authorization denied");
  }
};

export default verifyUserToken;