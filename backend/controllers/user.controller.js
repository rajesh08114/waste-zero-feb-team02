import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User, { getEffectiveUserStatus } from "../models/User.js";
import sendEmail from "../utils/email.js";
import { resolveWasteSkills } from "../constants/wasteSkills.js";

const getFrontendBaseUrl = () =>
  (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

const buildVerificationLink = (token) =>
  `${getFrontendBaseUrl()}/verify-email?token=${token}`;

const sendVerificationEmail = async (email, verificationLink) => {
  try {
    await sendEmail({
      email,
      subject: "Verify your WasteZero account",
      message: `Please verify your email by clicking this link: ${verificationLink}`,
      html: `
        <h1>Verify your WasteZero account</h1>
        <p>Please click the button below to verify your email address:</p>
        <a href="${verificationLink}" style="display:inline-block; background-color:#16a34a; color:white; padding:12px 24px; text-decoration:none; border-radius:8px; font-weight:bold;">Verify Email</a>
        <p>Or copy and paste this link: <br> ${verificationLink}</p>
      `,
    });
  } catch (emailError) {
    console.error("Error sending verification email:", emailError);
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, skills, location, bio } = req.body;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const allowedSignupRoles = ["volunteer", "NGO"];
    const { normalizedSkills, invalidSkills } = resolveWasteSkills(skills ?? []);

    if (!name || !normalizedEmail || !password || !role) {
      return res
        .status(400)
        .json({ message: "Name, email, password, and role are required" });
    }

    if (!allowedSignupRoles.includes(role)) {
      return res.status(400).json({
        message: "Only volunteer and NGO accounts can be created from signup.",
      });
    }

    if (invalidSkills.length > 0) {
      return res.status(400).json({
        message: `Skills must be related to waste management services. Invalid values: ${invalidSkills.join(", ")}`,
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      skills: normalizedSkills || [],
      location,
      bio,
    });
    await newUser.save();

    return res.status(201).json({
      message: "User registered successfully. Verify your email after login.",
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      email: decoded.email,
      verificationToken: token,
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification token" });
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    return res.status(400).json({ message: "Invalid or expired token", error });
  }
};

export const requestEmailVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified." });
    }

    const verificationToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    user.verificationToken = verificationToken;
    user.updatedAt = Date.now();
    await user.save();

    const verificationLink = buildVerificationLink(verificationToken);
    await sendVerificationEmail(user.email, verificationLink);

    return res.status(200).json({
      message: "Verification started. Please complete verification.",
      verificationLink,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

// generate JWT token
export const generateAccessToken = (user) => {
  const payload = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1h",
  });
};

export const generateRefreshToken = (user) => {
  const payload = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  });
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.status === "suspended") {
      return res
        .status(403)
        .json({ message: "Account suspended. Contact an administrator." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: getEffectiveUserStatus(user),
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -verificationToken");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const profile = user.toObject();
    profile.status = getEffectiveUserStatus(user);
    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name, skills, location, bio } = req.body;

    if (!name && !skills && !location && !bio) {
      return res.status(400).json({
        message:
          "At least one field (name, skills, location, bio) is required to update",
      });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if ("skills" in req.body) {
      const { normalizedSkills, invalidSkills } = resolveWasteSkills(skills);
      if (invalidSkills.length > 0) {
        return res.status(400).json({
          message: `Skills must be related to waste management services. Invalid values: ${invalidSkills.join(", ")}`,
        });
      }
      user.skills = normalizedSkills || [];
    }

    if (name) user.name = name;
    if (location) user.location = location;
    if (bio) user.bio = bio;
    user.updatedAt = Date.now();
    await user.save();
    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: getEffectiveUserStatus(user),
        skills: user.skills,
        location: user.location,
        bio: user.bio,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

export const changeUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.updatedAt = Date.now();
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};
