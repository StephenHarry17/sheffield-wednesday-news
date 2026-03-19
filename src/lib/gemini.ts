import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateSummary(articleContent: string, title: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `You are a sports news summarizer. Create a concise, engaging 2-3 sentence summary of this Sheffield Wednesday FC article.

Title: ${title}

Content: ${articleContent}

Summary:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating summary with Gemini:", error);
    throw error;
  }
}

export async function analyzeArticleCategory(title: string, excerpt: string): Promise<string> {
  // Return default category without calling API
  // If you get access to a working Gemini model later, you can add logic here
  return "Latest";
}