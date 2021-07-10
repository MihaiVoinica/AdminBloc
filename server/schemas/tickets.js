const mongoose = require("mongoose");

const ObjectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;

// Create Schema
const TicketSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
      ref: "users",
    },
    apartmentId: {
      type: ObjectId,
      required: true,
      ref: "apartments",
    },
    name: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["created", "confirmed", "resolved"],
      default: "created",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("tickets", TicketSchema);
