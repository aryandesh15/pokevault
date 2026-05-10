import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import clientPromise from "./lib/mongodb";

type UserDocument = {
  name: string;
  email: string;
  passwordHash: string;
  favoritePokemonIds: number[];
  createdAt: Date;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const client = await clientPromise;
    const db = client.db("pokevault");
    const usersCollection = db.collection<UserDocument>("users");

    const normalizedEmail = email.toLowerCase().trim();

    const user = await usersCollection.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordIsCorrect = await bcrypt.compare(password, user.passwordHash);

    if (!passwordIsCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({
        message: "JWT secret is not configured",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id?.toString(),
        email: user.email,
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id?.toString(),
        name: user.name,
        email: user.email,
        favoritePokemonIds: user.favoritePokemonIds || [],
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Something went wrong during login",
    });
  }
}