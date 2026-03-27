import Groq from "groq-sdk";
import type { Message } from "../context/Context";
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";

const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;

if (!groqApiKey) {
  throw new Error("VITE_GROQ_API_KEY is not defined in the environment.");
}

const groq = new Groq({ apiKey: groqApiKey, dangerouslyAllowBrowser: true });

export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string, mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const runChat = async (
  prompt: string, 
  history: Message[] = [], 
  imageData?: { data: string, mimeType: string }, 
  signal?: AbortSignal,
  onToken?: (text: string) => void
): Promise<string> => {
  try {
    const mappedHistory: ChatCompletionMessageParam[] = history.map(msg => {
      if (msg.role === 'user' && msg.image) {
        return {
          role: 'user',
          content: [
            { type: "text", text: msg.text },
            { type: "image_url", image_url: { url: `data:${msg.image.mimeType};base64,${msg.image.data}` } }
          ]
        };
      }
      return {
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.text
      } as ChatCompletionMessageParam;
    });

    const currentMessage: ChatCompletionMessageParam = imageData 
      ? {
          role: 'user',
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: `data:${imageData.mimeType};base64,${imageData.data}` } }
          ]
        }
      : { role: 'user', content: prompt };
      
    mappedHistory.push(currentMessage);

    const hasImageAnywhere = imageData || history.some(msg => msg.image);
    // Use llama-3.1-8b-instant for text and meta-llama/llama-4-scout-17b-16e-instruct for vision (replacing decommissioned ones)
    const modelToUse = hasImageAnywhere ? "meta-llama/llama-4-scout-17b-16e-instruct" : "llama-3.1-8b-instant";

    const chatStream = await groq.chat.completions.create({
      messages: mappedHistory,
      model: modelToUse,
      stream: true,
    }, { signal });

    let fullText = "";
    for await (const chunk of chatStream) {
      const token = chunk.choices[0]?.delta?.content || "";
      fullText += token;
      if (onToken && token) {
        onToken(fullText);
      }
    }

    return fullText;
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Groq API Error:", error);
    throw error;
  }
};

// Función temporal para simular la generación de imágenes.
// Groq es un motor de lenguaje (LLM), por lo que no genera imágenes de forma nativa.
export const generateImage = async (userPrompt: string) => {
  console.log("Solicitud de imagen recibida para:", userPrompt);
  return "Error: LLaMA no puede generar imágenes directamente. Se requiere un modelo como Flux o Stable Diffusion.";
};

