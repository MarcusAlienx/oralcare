import { Router } from "express";
import { db } from "@workspace/db";
import { conversations, messages } from "@workspace/db";
import { GoogleGenAI } from "@google/genai";
import { eq } from "drizzle-orm";
import {
  CreateGeminiConversationBody,
  SendGeminiMessageBody,
  SendGeminiMessageParams,
} from "@workspace/api-zod";

const router = Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy" });
const MODEL = "gemini-2.0-flash";

router.get("/conversations", async (req, res, next) => {
  try {
    const all = await db.select().from(conversations).orderBy(conversations.createdAt);
    res.json(all);
  } catch (err) {
    next(err);
  }
});

router.post("/conversations", async (req, res, next) => {
  try {
    const body = CreateGeminiConversationBody.parse(req.body);
    const [created] = await db.insert(conversations).values({ title: body.title }).returning();
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.post("/conversations/:id/messages", async (req, res, next) => {
  try {
    const { id } = SendGeminiMessageParams.parse({ id: Number(req.params.id) });
    const body = SendGeminiMessageBody.parse(req.body);
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    if (!conversation) return res.status(404).json({ error: "Conversation not found" });

    await db.insert(messages).values({ conversationId: id, role: "user", content: body.content });
    const previousMessages = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const systemInstruction = "Eres la asistente dental de A&E OralCare. Responde brevemente y redirige a WhatsApp para citas.";
    const chat = ai.getGenerativeModel({ model: MODEL, systemInstruction }).startChat({
      history: previousMessages.slice(0, -1).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    });

    const stream = await chat.sendMessageStream(body.content);
    let fullResponse = "";
    for await (const chunk of stream.stream) {
      const content = chunk.text();
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    await db.insert(messages).values({ conversationId: id, role: "assistant", content: fullResponse });
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    next(err);
  }
});

export default router;
