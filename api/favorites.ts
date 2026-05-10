import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import clientPromise from "./lib/mongodb";

type TokenPayload = {
  userId: string;
  email: string;
};

type UserDocument = {
  name: string;
  email: string;
  passwordHash: string;
  favoritePokemonIds: number[];
  createdAt: Date;
};

function getUserFromToken(req: VercelRequest): TokenPayload | null {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return null;
  }

  try {
    return jwt.verify(token, jwtSecret) as TokenPayload;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const userFromToken = getUserFromToken(req);

    if (!userFromToken) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    const client = await clientPromise;
    const db = client.db("pokevault");
    const usersCollection = db.collection<UserDocument>("users");

    const userObjectId = new ObjectId(userFromToken.userId);

    if (req.method === "GET") {
      const user = await usersCollection.findOne({
        _id: userObjectId,
      });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      return res.status(200).json({
        favoritePokemonIds: user.favoritePokemonIds || [],
      });
    }

    if (req.method === "POST") {
      const { pokemonId } = req.body;

      if (typeof pokemonId !== "number") {
        return res.status(400).json({
          message: "pokemonId must be a number",
        });
      }

      await usersCollection.updateOne(
        { _id: userObjectId },
        {
          $addToSet: {
            favoritePokemonIds: pokemonId,
          },
        }
      );

      const updatedUser = await usersCollection.findOne({
        _id: userObjectId,
      });

      return res.status(200).json({
        message: "Favorite added",
        favoritePokemonIds: updatedUser?.favoritePokemonIds || [],
      });
    }

    if (req.method === "DELETE") {
      const { pokemonId } = req.body;

      if (typeof pokemonId !== "number") {
        return res.status(400).json({
          message: "pokemonId must be a number",
        });
      }

      await usersCollection.updateOne(
        { _id: userObjectId },
        {
          $pull: {
            favoritePokemonIds: pokemonId,
          },
        }
      );

      const updatedUser = await usersCollection.findOne({
        _id: userObjectId,
      });

      return res.status(200).json({
        message: "Favorite removed",
        favoritePokemonIds: updatedUser?.favoritePokemonIds || [],
      });
    }

    return res.status(405).json({
      message: "Method not allowed",
    });
  } catch (error) {
    console.error("Favorites error:", error);

    return res.status(500).json({
      message: "Something went wrong with favorites",
    });
  }
}