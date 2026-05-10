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
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const client = await clientPromise;
    const db = client.db("pokevault");
    const usersCollection = db.collection<UserDocument>("users");

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await usersCollection.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser: UserDocument = {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      favoritePokemonIds: [],
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({
        message: "JWT secret is not configured",
      });
    }

    const token = jwt.sign(
      {
        userId: result.insertedId.toString(),
        email: normalizedEmail,
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: result.insertedId.toString(),
        name: newUser.name,
        email: newUser.email,
        favoritePokemonIds: newUser.favoritePokemonIds,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      message: "Something went wrong during signup",
    });
  }
}