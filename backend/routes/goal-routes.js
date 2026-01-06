const express = require("express");
const router = express.Router();
const Goal = require("../models/goal.model");
const User = require("../models/user.model");

async function getUserIdFromEmail(req, res, next) {
    const email = req.query.email || req.body.email;
    if (!email) return res.status(401).json({ message: "Email required" });
  
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not found" });
  
    req.userId = user._id;
    next();
}

router.get("/", getUserIdFromEmail, async (req, res) => {
    try {
      const goals = await Goal.find({ user: req.userId });
      res.json(goals);  // returns [] if new user
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
});
  
router.post("/", getUserIdFromEmail, async (req, res) => {
    try {
      const { name, description } = req.body;
      const goal = new Goal({ name, description, user: req.userId });
      await goal.save();
      res.json(goal);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to create goal" });
    }
});
  
router.put("/:id", getUserIdFromEmail, async (req, res) => {
    const goal = await Goal.findOneAndUpdate(
        { _id: req.params.id, user: req.userId },
        req.body,
        { new: true }
    );
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    res.json(goal);
});
  
router.delete("/:id", getUserIdFromEmail, async (req, res) => {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    res.json({ message: "Goal deleted" });
});
  
module.exports = router;