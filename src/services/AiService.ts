import { GoogleGenAI } from '@google/genai';
import { BIBLE_SYSTEM_INSTRUCTION } from "../constants/Data";

// const genAI = new GoogleGenerativeAI("AIzaSyDK80AORZNNiZVIdGElHaaM53Ql4CvBFRo");

// const model = genAI.getGenerativeModel({
//   model: "gemini-1.5-flash", // Use 1.5 Flash for speed and cost-efficiency
//   systemInstruction: BIBLE_SYSTEM_INSTRUCTION,
//   // Configure safety settings to be highly restrictive
//   safetySettings: [
//     {
//       category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
//       threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
//     },
//     {
//       category: HarmCategory.HARM_CATEGORY_HARASSMENT,
//       threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
//     },
//   ],
// });
// // 1. Define the restricted "Bible Scholar" persona
// const BIBLE_SYSTEM_PROMPT = `
//   You are a specialized Bible Study Assistant. 

//   CORE RESTRICTIONS:
//   - You ONLY answer questions related to the Bible, theology, or Christian history.
//   - If a user asks about non-biblical topics (e.g., weather, politics, coding, celebrities), 
//     politely refuse by saying: "I am specialized only in Biblical study. How can I help you understand the Word today?"
//   - Use a scholarly, respectful, and helpful tone.
//   - Always provide Scripture references (e.g., John 3:16) for your claims.
// `;

// 2. Initialize the client (Replace with your actual key or env variable)
// const API_KEY = "YOUR_GEMINI_API_KEY";

/**
 * Service to handle restricted AI Bible interactions
 */
export default class AiService {
    private static instance: AiService;
    private readonly AI: any;
    private readonly model: any;

    constructor() {
        this.AI = new GoogleGenAI({ apiKey: "AIzaSyDK80AORZNNiZVIdGElHaaM53Ql4CvBFRo" });
        // this.model = this.AI.models.generateContent({
        //     model: "gemini-3-flash-preview",
        //     systemInstruction: BIBLE_SYSTEM_INSTRUCTION,
        //     safetySettings: [
        //         {
        //           category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        //           threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        //         },
        //         {
        //           category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        //           threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        //         },
        //       ],
        // });
    }

    public static getInstance(): AiService {
        if (!AiService.instance) {
            AiService.instance = new AiService();
        }
        return AiService.instance;
    }

    public async startBibleChat(prompt: string): Promise<string> {
        try {
            // Try using the non-streaming API first as it's more reliable in React Native
            const result = await this.AI.models.generateContent({
                model: 'gemini-2.5-flash',//"gemini-3-flash-preview",
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                config: {
                    systemInstruction: BIBLE_SYSTEM_INSTRUCTION,
                    temperature: 0.7,
                    topP: 0.95,
                },
            });
            
            console.log('[AI] result', result);
            
            // Handle both cases: result.text as property or method
            const responseText = typeof result.text === 'function' 
                ? result.text() 
                : (result.text || result.response?.text() || '');
            
            console.log('[AI] response', responseText);
            
            if (!responseText || responseText.trim().length === 0) {
                return "I apologize, but I received an empty response. Please try again.";
            }
            
            return responseText;
        } catch (error) {
            console.error('[AI] Error in startBibleChat:', error);
            
            // If the error mentions streaming, try the chat API as fallback
            if (error instanceof Error && error.message.includes('stream')) {
                try {
                    console.log('[AI] Attempting fallback with chat API...');
                    const chat = this.AI.chats.create({
                        model: 'gemini-2.5-flash',//'gemini-3-flash-preview',
                        config: {
                            systemInstruction: BIBLE_SYSTEM_INSTRUCTION,
                            temperature: 0.7,
                            topP: 0.95,
                        }
                    });

                    const streamResult = await chat.sendMessageStream({ message: prompt });
                    console.log('[AI] stream result', streamResult);

                    // Collect all chunks from the stream
                    let fullText = '';
                    let chunkCount = 0;
                    for await (const chunk of streamResult) {
                        chunkCount++;
                        console.log('[AI] chunk', chunkCount, chunk);
                        const text = chunk?.text || chunk?.content || '';
                        if (text) {
                            fullText += text;
                        }
                    }

                    console.log('[AI] stream response', fullText);
                    
                    if (!fullText || fullText.trim().length === 0) {
                        return "I apologize, but I received an empty response. Please try again.";
                    }
                    
                    return fullText;
                } catch (fallbackError) {
                    console.error('[AI] Fallback also failed:', fallbackError);
                }
            }
            
            return "I apologize, but I encountered an error connecting to the scriptural records. Please try again in a moment.";
        }
    }

    public async generateContent(prompt: string): Promise<string> {
        try {
            console.log('[AI] prompt', prompt);
            const result = await this.AI.models.generateContent({
                model: "gemini-1.5-flash",
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                config: {
                    systemInstruction: BIBLE_SYSTEM_INSTRUCTION,
                    temperature: 0.2,
                    maxOutputTokens: 500,
                },
            });
            console.log('[AI] result', result.response);

            // Handle both cases: result.text as property or method
            const responseText = typeof result.text === 'function' 
                ? result.text() 
                : (result.text || result.response?.text() || '');
            
            return responseText;
        } catch (error) {
            console.error('[AI] Error in generateContent:', error);
            return "I apologize, but I encountered an error connecting to the scriptural records. Please try again in a moment.";
        }
    }
};