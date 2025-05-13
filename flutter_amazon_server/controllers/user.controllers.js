import User from "../models/user.models.js";
import { errorHandler } from "../utils/errorHandler.js";

export const createUser = async (request, response, next) => {
  try {
    const {
      first_name,
      last_name,
      phone_no,
      id_number,
      gender,
      address,
      town_city,
      county,
    } = request.body;

    const authId = request.user.id;
    const isAdmin = request.user.role !== "admin";

    // Restrict regular users from creating multiple accounts
    if (!isAdmin) {
      const existingClient = await User.findOne({ authId });
      if (existingClient) {
        return next(errorHandler(403, "You can only create one user account"));
      }
    }

    const existingUser = await User.findOne({
      $or: [{ id_number }, { phone_no }],
    });

    if (existingUser) {
      return next(
        errorHandler(400, "User with provided details already exists")
      );
    }

    // Create new user
    const newUser = new User({
      authId,
      first_name,
      last_name,
      phone_no,
      id_number,
      gender,
      address,
      town_city,
      county,
    });

    // Save to database
    const savedUser = await newUser.save();

    // Respond with success message
    response.status(201).json({
      success: true,
      message: "User created successfully",
      savedUser,
    });
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "Failed to create user", error));
  }
};

export const getAllUsers = async (request, response, next) => {
  try {
    const users = await User.find();

    response.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(errorHandler(500, "Failed to fetch users", error));
  }
};

export const getUserById = async (request, response, next) => {
  try {
    const userId = request.params.id;
    const user = await User.findById(userId)
      .populate({
        path: "authId",
        select: "username email role",
      })
      .lean();

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    response.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(errorHandler(500, "Failed to fetch user", error));
  }
};

export const updateUser = async (request, response, next) => {
  try {
    const userId = request.params.id;
    const {
      first_name,
      last_name,
      phone_no,
      id_number,
      gender,
      address,
      town_city,
      county,
    } = request.body;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    // Ensure user making the request is the owner of the client record
    if (user.userId.toString() !== request.user.id) {
      return next(
        errorHandler(403, "Unauthorized: You can only update your own account")
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        first_name,
        last_name,
        phone_no,
        id_number,
        gender,
        address,
        town_city,
        county,
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return next(errorHandler(404, "User not found"));
    }

    response.status(200).json({
      success: true,
      message: "User updated successfully",
      updatedUser,
    });
  } catch (error) {
    next(errorHandler(500, "Failed to update user", error));
  }
};

export const deleteUser = async (request, response, next) => {
  try {
    const userId = request.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return next(errorHandler(404, "User not found"));
    }

    response.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(errorHandler(500, "Failed to delete user", error));
  }
};
