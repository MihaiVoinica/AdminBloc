const mongoose = require("mongoose");
const { usersConfig } = require("../config");

const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    required: true,
    enum: Object.values(usersConfig.ROLES),
  },
  blocked: {
    type: Boolean,
    required: false,
  },
  activationPin: {
    type: String,
    required: false,
  },
  activationToken: {
    type: String,
    required: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("users", UserSchema);
