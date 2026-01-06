const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

const Goal = mongoose.models.Goal || mongoose.model("Goal", goalSchema);

module.exports = Goal;