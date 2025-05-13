import bcryptjs from "bcryptjs";
import Auth from "../models/auth.models.js";
import { errorHandler } from "../utils/errorHandler.js";

export const signup = async (request, response, next) => {
  try {
    const { username, email, password } = request.body;

    if (!username || !email || !password) {
      next(errorHandler(400, "All fields are required."));
    }

    // Check if username or email already exists
    const existingUser = await Auth.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return next(
        errorHandler(
          400,
          existingUser.email === email
            ? "Email is already in use."
            : "Username is already taken."
        )
      );
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new Auth({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    response.status(201).json({
      success: true,
      message: "Sign Up Successful",
      user: savedUser,
    });
  } catch (error) {
    next(errorHandler(500, "Something went wrong. Please try again."));
  }
};

export const signin = async (request, response, next) => {
  const { email, password } = request.body;

  if (!email || !password) {
    next(errorHandler(404, "All fields are required."));
  }

  try {
    const validUser = await Auth.findOne({ email });
    if (!validUser) {
      return next(errorHandler(404, "User not found"));
    }
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(
        errorHandler(400, "Invalid password. The password is incorrect.")
      );
    }
    const token = jwt.sign(
      { id: validUser._id, role: validUser.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    const { password: pass, ...rest } = validUser._doc;

    response
      .status(200)
      .cookie("access_token", token, { httpOnly: true })
      .json({
        success: true,
        message: "User has signed in successfully.",
        user: rest,
      });
  } catch (error) {
    next(errorHandler(500, "Error signing in."));
  }
};

export const signout = (request, response, next) => {
  try {
    response.clearCookie("access_token").status(200).json({
      success: true,
      message: "User has been signed out successfully.",
    });
  } catch (error) {
    next(errorHandler(500, "Error signing out."));
  }
};
