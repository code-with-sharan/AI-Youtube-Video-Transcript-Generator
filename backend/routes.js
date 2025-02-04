import express from "express"
const router = express.Router()
import { getCaptions, getResponseFromGPT } from "./controllers.js"

router.post("/transcript", getCaptions)
router.post("/gpt-response", getResponseFromGPT)

export default router