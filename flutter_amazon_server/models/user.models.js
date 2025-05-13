import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    authId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },

    // Personal Information
    first_name: {
      type: String,
      required: false, // Optional field
    },
    last_name: {
      type: String,
      required: false, // Optional field
    },
    id_number: {
      type: String,
      required: true,
      unique: true,
    },
    phone_no: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      default: "",
    },
    town_city: {
      type: String,
      required: true,
    },
    county: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
