
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const path = require("path");
const userRoutes = require("./routes/user-routes");
const User = require("./models/user.model");
const Goal = require("./models/goal.model"); 

const PORT = 8080; 

app.use(express.static(path.join(__dirname, "../public")));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if(req.method === "OPTIONS"){
        console.log("CORS pre-check request received");
        return res.sendStatus(200);
    }
    next();
});

app.use(bodyParser.json());
app.use("/api/users", userRoutes);
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

app.get("/api/goals", async (req, res) => {
    try{
        const email = req.query.email;
        if (!email) return res.status(400).json({ message: "Email required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const goals = await Goal.find({ user: user._id });
        res.json(goals);
    }catch(err){
        console.error("Error fetching goals:", err);
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/goals", async (req, res) => {
    try{
        const { name, description, email } = req.body;
        if (!email) return res.status(400).json({ message: "Email required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const goal = new Goal({ name, description, user: user._id });
        await goal.save();
        console.log("Goal added:", goal);

        res.json(goal);
    }catch (err){
        console.error("Error creating goal:", err);
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/goals/:id", async (req, res) => {
    try{
        console.log("PUT /api/goals/:id called");
        const { id } = req.params;
        const updates = req.body;
        const goal = await Goal.findByIdAndUpdate(id, updates, { new: true });
        console.log("Goal updated:", goal);
        res.json(goal);
    }catch (err){
        console.error("Error updating goal:", err);
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/goals/:id", async (req, res) => {
    try{
        console.log("DELETE /api/goals/:id called");
        const { id } = req.params;
        await Goal.findByIdAndDelete(id);
        console.log("Goal deleted");
        res.json({ message: "Goal deleted" });
    }catch (err){
        console.error("Error deleting goal:", err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});