import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

const SALT_ROUNDS = process.env.NODE_ENV === "test" ? 4 : 12;

// Compared against when the username does not exist, so a login takes about as long either way.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", SALT_ROUNDS);

export const registerUser = async (req, res) => {
  const { username, password } = req.body;

  if (await User.exists({ username })) {
    return res.status(409).json({ message: "Username is already taken" });
  }

  try {
    await User.create({ username, password: await bcrypt.hash(password, SALT_ROUNDS) });
  } catch (err) {
    // Two registrations for the same name can pass the check above at the same time.
    if (err.code === 11000) {
      return res.status(409).json({ message: "Username is already taken" });
    }
    throw err;
  }

  res.status(201).json({ message: "User registered" });
};

export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  const passwordMatches = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);

  // One message for both cases, so the API does not reveal which usernames exist.
  if (!user || !passwordMatches) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign({ sub: user._id.toString() }, req.app.locals.jwtSecret, {
    algorithm: "HS256",
    expiresIn: "1d",
  });

  res.json({ message: "Login successful", token, username: user.username });
};
