import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// =====================
// Тестовый GET маршрут
// =====================
app.get("/", (req, res) => {
  res.send("Server is live! Backend работает.");
});

// =====================
// POST маршрут для генерации картинки
// =====================
app.post("/api/qwen-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await fetch(
      "https://router.huggingface.co/models/Qwen/Qwen-Image-Edit",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt
        })
      }
    );

    // =====================
    // Логируем ошибки Hugging Face
    // =====================
    if (!response.ok) {
      const text = await response.text();
      console.error("Hugging Face error:", text); // <- этот console.log
      return res.status(500).json({ error: text });
    }

    const buffer = await response.arrayBuffer();
    res.set("Content-Type", "image/png");
    res.send(Buffer.from(buffer));

  } catch (e) {
    console.error("Server error:", e); // <- тоже логируем
    res.status(500).json({ error: "Generation error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
