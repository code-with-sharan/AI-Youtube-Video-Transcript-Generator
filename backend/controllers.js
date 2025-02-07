import { getSubtitles } from 'youtube-captions-scraper';
import { GoogleGenerativeAI } from "@google/generative-ai";

export const getCaptions = async (req, res) => {
    const { videoId } = req.body

    try {
        const captions = await getSubtitles({
            videoID: videoId, // youtube video id
            lang: 'en' // default: `en`
        })

        // Extracting start time and text from the captions
        let dataArray = []
        captions.forEach(caption => {
            dataArray.push({ start: caption.start, text: caption.text }) // return total seconds
        })

        res.json({ success: true, data: dataArray })
    } catch (error) {
        console.log(error)
        res.json({ success: false, error: error })
    }
}

export const getStreamResponseFromGPT = async (req, res) => {
    try {
        const { transcript, question } = req.body
        const transcriptText = transcript.map(caption => caption.text).join(" ")
        const transcriptArrayWithFormattedTime = transcript.map(caption => {
            const minutes = Math.floor(caption.start / 60).toString().padStart(2, '0')
            const seconds = Math.floor(caption.start % 60).toString().padStart(2, '0')
            return {
                start: `${minutes}:${seconds}`,
                text: caption.text
            }
        })

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const prompt = `
    Role: You are a YouTube Transcript Expert with precise timestamp knowledge. Your goal is to help users understand video content using both transcript text and exact timestamps.

Instructions:
1. Analyze both the full transcript text and timestamped array data
2. Answer STRICTLY using information from the transcript
3. Always include **exact timestamps** in their original format when:
   - Quoting direct transcript excerpts
   - Referencing specific video sections
   - Identifying key moments

Capabilities:
- Timestamped summaries with video positions
- Technical explanations with context timing
- Multi-timestamp references for recurring topics
- Comparative analysis with timecodes
- Ambiguity resolution using adjacent timestamps

Response Requirements:
1. Begin with clear, timestamped answer when applicable
2. Include 1-3 relevant timestamped excerpts
**3. Format timestamps as bold [**03:18**] before excerpts**
4. Maintain concise but complete answers
5. Use bullet points for multiple timestamps

Transcript Format:
Full Text: """${transcriptText}"""
Timestamped Data:
${transcriptArrayWithFormattedTime.map(entry => `- [${entry.start}s] ${entry.text}`).join('\n')}

Example Response:
The video discusses learning techniques at [**03:18**]:  
"**03:18**: further hinder your ability to retain"  
Additional tips appear at [**05:42**] about memory consolidation.

User Question: """${question}"""
    `;

        // Get streaming result
        const result = await model.generateContentStream(prompt); 
        // Set headers for streaming
        res.setHeader('Content-Type', 'text/plain'); // Set Content-Type to text/plain since we're sending raw text chunks
        res.setHeader('Transfer-Encoding', 'chunked') // Enable streaming response in chunks

        // stream chunks to the client
        for await (const chunk of result.stream) {
            const chunkText = chunk.text()            
            res.write(chunkText)
            // Force flush the response buffer to ensure immediate delivery
            await new Promise(resolve => process.nextTick(resolve))
        }

        res.end()
    } catch (error) {
        res.json({ success: false, error: error })
    }
}