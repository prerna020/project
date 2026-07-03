import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/users.js";
import tweetRoutes from "./routes/tweets.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/users", userRoutes);
app.use("/tweets", tweetRoutes);

app.get("/health", (_, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});