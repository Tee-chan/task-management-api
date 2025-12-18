import mongoose from "mongoose";
import dotEnv from "dotenv";
import User from "../models/User.js";

dotEnv.config({ path: "./.env" });
const PORT = process.env.PORT || 8000;

const startDbAndServer = async (app) => {
  try {
    mongoose
      .connect(process.env.MONGODB_URI)
      .then(async () => {
        app.listen(PORT, () => console.log("THE SERVER AND DB ARE OK"));
        // console.log("MongoDB Connected ");
      })
      .catch((error) => {
        console.log("Error connecting to the database:", error.message);
        setTimeout(() => {
          console.log("Retrying in 3 seconds...");
          startDbAndServer(app);
        }, 3000);
      });
  } catch (error) {
    console.log("unable to start the server:", error.message);
    setTimeout(() => {
      console.log("retrying in 3sec.");
      startDbAndServer();
    }, 3000);
    process.exit(1);
  }
};

export default startDbAndServer;