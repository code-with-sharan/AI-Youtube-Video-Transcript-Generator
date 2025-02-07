import express from "express"
const router = express.Router()
import { getCaptions, getStreamResponseFromGPT } from "./controllers.js"

router.post("/transcript", getCaptions)
router.post("/gpt-response-stream", getStreamResponseFromGPT)

export default router