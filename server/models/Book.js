import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    author: {
      type: String,
      required: true
    },

    category: {
      type: String,
      required: true
    },

    coverUrl: {
      type: String,
      default: ""
    },

    description: {
      type: String,
      default: ""
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Book", bookSchema);