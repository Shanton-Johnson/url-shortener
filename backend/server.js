import express from "express";
import mongoose from "mongoose";
import { nanoid } from "nanoid";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000"  // React dev server
}));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

const UrlSchema = new mongoose.Schema({
  longUrl: String,
  shortCode: String
});

const Url = mongoose.model("Url", UrlSchema);

// Shorten URL API
app.post("/shorten", async (req, res) => {
  const { longUrl } = req.body;
  let shortCode = nanoid(6);

  const url = new Url({ longUrl, shortCode });
  await url.save();

  res.json({ shortUrl: `http://localhost:5000/${shortCode}` });
});

// Redirect to long URL
app.get("/:shortCode", async (req, res) => {
  const url = await Url.findOne({ shortCode: req.params.shortCode });
  if (url) {
    res.redirect(url.longUrl);
  } else {
    res.status(404).json({ error: "URL not found" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
