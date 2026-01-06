const User = require("../models/user.model.js")
const bcrypt = require("bcrypt");


async function getUserByName(name) {
    const regex = new RegExp(name, 'i');
    return await User.find({ name: regex }, 'name email')
}

async function getAllUsers() {
    let users = await User.find().select('-password')
    return users
}

async function addUser({ name, email, password }) {
  const hashedPassword = await bcrypt.hash(password, 10); 
  const user = new User({ name, email, password: hashedPassword });
  return user.save();
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid password");
  return user;
}

module.exports = {
    getUserByName,
    getAllUsers,
    addUser,
    loginUser
};