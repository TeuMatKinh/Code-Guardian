import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function askTutor(
  question: string,
  context: { course: string; day: number; content: string; userCode?: string; language: 'en' | 'vi' }
) {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are the Code Guardian AI Tutor. Your goal is to help students learn coding.
    Current Context:
    - Course: ${context.course}
    - Day: ${context.day}
    - Lesson Content: ${context.content}
    ${context.userCode ? `- User's Current Code: \n\`\`\`\n${context.userCode}\n\`\`\`` : ""}
    
    Rules:
    1. Be encouraging and clear.
    2. Answer in ${context.language === 'vi' ? 'Vietnamese' : 'English'}.
    3. If the user provides code, review it and give constructive feedback.
    4. Don't just give the answer; explain the logic so they learn.
    5. Keep explanations simple but technically accurate.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: question,
      config: {
        systemInstruction,
      },
    });

    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The AI Tutor is currently unavailable. Please try again later.";
  }
}
