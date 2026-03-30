import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/userModel.js";
import { sendOTPVerificationEmail, sendPasswordResetEmail } from "../config/nodemailer.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

//Route for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    if (user.isBlocked) {
      return res.json({ success: false, message: "Your account has been blocked. Please contact support." });
    }

    if (!user.isVerified) {
      return res.json({ success: false, message: "Please verify your email address to login.", requireVerification: true, email: user.email });
    }

    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//Route for user register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // checking user already exists or not
    const exists = await userModel.findOne({ email });
    if (exists) {
      if (exists.isVerified) {
        return res.json({ success: false, message: "User already exists. Please login." });
      } else {
        // User exists but not verified. Generate a new OTP and resend it automatically!
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = await bcrypt.genSalt(10);
        const hashedOTP = await bcrypt.hash(otp, salt);

        exists.otp = hashedOTP;
        exists.otpExpiresAt = Date.now() + 10 * 60 * 1000;
        await exists.save();

        await sendOTPVerificationEmail({ email, otp });

        return res.json({ success: true, message: "Verification required. A new OTP has been sent.", pendingVerification: true });
      }
    }

    // validating email format & strong password
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await bcrypt.hash(otp, salt);

    let profileImageUrl = "";
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { resource_type: 'image' });
      profileImageUrl = result.secure_url;
    }

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      otp: hashedOTP,
      otpExpiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      profilePhoto: profileImageUrl
    });

    await newUser.save();

    // Send the email
    await sendOTPVerificationEmail({ email, otp });

    res.json({
      success: true,
      message: "Verification email sent. Please check your inbox.",
      pendingVerification: true
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message })
  }
}

// Route to verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.json({ success: false, message: "Email and OTP are required" });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.json({ success: false, message: "Email is already verified. Please login." });
    }

    if (user.otpExpiresAt < Date.now()) {
      return res.json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    const isMatch = await bcrypt.compare(otp, user.otp);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    // Mark as verified and clear OTP fields
    user.isVerified = true;
    user.otp = "";
    user.otpExpiresAt = undefined;
    await user.save();

    // Verify successful, issue token
    const token = createToken(user._id);
    res.json({ success: true, message: "Email verified successfully!", token });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route to resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.json({ success: false, message: "User is already verified. Please login." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedOTP = await bcrypt.hash(otp, salt);

    user.otp = hashedOTP;
    user.otpExpiresAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendOTPVerificationEmail({ email, otp });

    res.json({ success: true, message: "A new OTP has been sent to your email." });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// In-memory store for Admin OTPs
const adminOtpStore = new Map();

// Route for Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      adminOtpStore.set(email, {
        otp: otp,
        expiresAt: Date.now() + 10 * 60 * 1000 // 10 mins
      });

      await sendOTPVerificationEmail({ email, otp });

      res.json({ success: true, pendingVerification: true, message: "OTP sent to admin email" });
    }
    else {
      res.json({ success: false, message: "Invalid Credentials" })
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message })
  }
};

// Route for Admin OTP verification
const verifyAdminOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (email !== process.env.ADMIN_EMAIL) {
      return res.json({ success: false, message: "Invalid admin email" });
    }

    const storedOtpData = adminOtpStore.get(email);

    if (!storedOtpData) {
      return res.json({ success: false, message: "No OTP request found. Please login again." });
    }

    if (Date.now() > storedOtpData.expiresAt) {
      adminOtpStore.delete(email);
      return res.json({ success: false, message: "OTP has expired. Please login again." });
    }

    if (storedOtpData.otp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    // OTP is valid
    adminOtpStore.delete(email);
    const token = jwt.sign(process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD, process.env.JWT_SECRET);
    res.json({ success: true, token, message: "Admin verified successfully" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({ success: false, message: "Email is required" });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found!" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedOTP = await bcrypt.hash(otp, salt);

    user.otp = hashedOTP;
    user.otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    await sendPasswordResetEmail({ email, otp });

    res.json({ success: true, message: "Password reset OTP sent to your email." });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for reset password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.otpExpiresAt < Date.now()) {
      return res.json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    const isMatch = await bcrypt.compare(otp, user.otp);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password and clear OTP
    user.password = hashedPassword;
    user.otp = "";
    user.otpExpiresAt = undefined;

    // Auto-verify if they happened to be unverified before resetting
    user.isVerified = true;

    await user.save();

    res.json({ success: true, message: "Password has been successfully updated. Please login." });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route to get User Profile
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.body;

    // Find user by ID (injected by authUser middleware) and select only safe fields
    const user = await userModel.findById(userId).select('-password -otp -otpExpiresAt');

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route to update User Profile (Name only)
const updateUserProfile = async (req, res) => {
  try {
    const { userId, name } = req.body;

    if (!name || name.trim() === "") {
      return res.json({ success: false, message: "Name cannot be empty" });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { name: name.trim() },
      { new: true } // Return the updated document
    ).select('-password -otp -otpExpiresAt');

    if (!updatedUser) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Profile updated successfully!", user: updatedUser });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route to add User Address
const addUserAddress = async (req, res) => {
  try {
    const { userId, address } = req.body;

    if (!address || Object.keys(address).length === 0) {
      return res.json({ success: false, message: "Address details are required" });
    }

    // Add unique ID to address for easy removal later
    const newAddress = { ...address, id: Date.now().toString() };

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    user.addresses.push(newAddress);
    await user.save();

    res.json({ success: true, message: "Address added successfully", addresses: user.addresses });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route to remove User Address
const removeUserAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    user.addresses = user.addresses.filter(addr => addr.id !== addressId);
    await user.save();

    res.json({ success: true, message: "Address removed successfully", addresses: user.addresses });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route to update User Address
const updateUserAddress = async (req, res) => {
  try {
    const { userId, addressId, updatedAddress } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const addressIndex = user.addresses.findIndex(addr => addr.id === addressId);
    if (addressIndex === -1) {
      return res.json({ success: false, message: "Address not found" });
    }

    // Update with new data but keep the same ID
    user.addresses[addressIndex] = { ...updatedAddress, id: addressId };
    await user.save();

    res.json({ success: true, message: "Address updated successfully", addresses: user.addresses });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

import fs from 'fs';
import path from 'path';

// Route for Admin Forgot Password
const adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (email !== process.env.ADMIN_EMAIL) {
      return res.json({ success: false, message: "Invalid email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    adminOtpStore.set(email + "_reset", {
      otp: otp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 mins
    });

    await sendPasswordResetEmail({ email, otp });

    res.json({ success: true, message: "Password reset OTP sent to admin email." });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for Admin Reset Password
const adminResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (email !== process.env.ADMIN_EMAIL) {
      return res.json({ success: false, message: "Invalid email" });
    }

    const storedOtpData = adminOtpStore.get(email + "_reset");

    if (!storedOtpData) {
      return res.json({ success: false, message: "No reset request found." });
    }

    if (Date.now() > storedOtpData.expiresAt) {
      adminOtpStore.delete(email + "_reset");
      return res.json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    if (storedOtpData.otp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    // OTP is valid. Update .env
    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Replace the ADMIN_PASSWORD line
    const regex = new RegExp(`^ADMIN_PASSWORD\\s*=.*$`, 'm');
    envContent = envContent.replace(regex, `ADMIN_PASSWORD = "${newPassword}"`);
    fs.writeFileSync(envPath, envContent);

    // Update in-memory process.env so it works without server restart immediately
    process.env.ADMIN_PASSWORD = newPassword;

    adminOtpStore.delete(email + "_reset");

    res.json({ success: true, message: "Admin password successfully updated. Please login." });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { loginUser, registerUser, adminLogin, verifyAdminOTP, adminForgotPassword, adminResetPassword, verifyOTP, resendOTP, forgotPassword, resetPassword, getUserProfile, updateUserProfile, addUserAddress, removeUserAddress, updateUserAddress };
