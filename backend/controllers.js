import { getSubtitles } from 'youtube-captions-scraper';
import { GoogleGenerativeAI } from "@google/generative-ai";

export const getCaptions = async (req, res) => {
    const { videoId } = req.body

    try {
        const captions = await getSubtitles({
            videoID: videoId, // youtube video id
            lang: 'en' // default: `en`
        })
        // I want only the text of the captions and join the resultant strings from the array
        const textCaptions = captions.map(caption => caption.text).join(" ")
        res.json({ success: true, data: textCaptions })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error })
    }
}

export const getResponseFromGPT = async (req, res) => {
    try {
        const { transcript, question } = req.body
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
    Role: You are a YouTube Transcript Expert Assistant. Your goal is to help users understand video content by analyzing the exact transcript they provide.

Instructions:
1. Carefully read and analyze the provided YouTube transcript
2. Answer ONLY using information from the transcript
3. If the question can't be answered using the transcript, respond: "This information isn't covered in the video"

Capabilities:
- Summarize specific sections or entire video
- Explain technical terms/concepts using video context
- Find key points and themes
- Locate timestamps for mentioned topics
- Compare ideas discussed in the video
- Clarify ambiguous statements from the transcript

Limitations:
- Never mention you're an AI
- Don't speculate beyond transcript content
- Avoid personal opinions
- Refuse requests for predictions/future events
- Reject harmful/offensive questions politely

Response Guidelines:
1. Start with direct answer
2. Include relevant transcript excerpts (1-3 sentences)
3. Add timestamp if available in transcript
4. Keep responses concise but thorough
5. Use bullet points for lists when helpful

Note: Return result in markdown format

Current Transcript: """${transcript}"""

User Question: """${question}"""
    `;

        const result = await model.generateContent(prompt);
        const gptResponse = result.response.text()
        res.json({ success: true, data: gptResponse })
    } catch (error) {
        res.json({ success: false, error: error })
    }
}