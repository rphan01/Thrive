const express = require("express");
const router = express.Router();
const userService = require("../services/user-service");


// CREATE USER (Sign Up)
router.post("/register", async (req, res) => {
  try{
    const { name, email, password } = req.body;
    if (!name || !email || !password){
      return res.status(400).json({ message: "All fields required" });
    }
    const newUser = await userService.addUser({ name, email, password });
    res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  }catch(error){
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during signup" });
  }
});

// LOGIN USER
router.post("/login", async (req, res) => {
  try{
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    const user = await userService.loginUser({ email, password });
    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  }catch (error){
    res.status(400).json({ message: error.message });
  }
});


// GET ALL USERS
router.get("/users", async (req, res) => {
  try{
    const users = await userService.getAllUsers();
    res.json(users);
  }catch(error){
    res.status(500).json({ message: "Could not get users" });
  }
});

// SEARCH USERS BY NAME
router.get("/search/:name", async (req, res) => {
  try{
    const results = await userService.getUserByName(req.params.name);
    res.json(results);
  }catch (error){
    res.status(500).json({ message: "Search failed" });
  }
});

module.exports = router;
