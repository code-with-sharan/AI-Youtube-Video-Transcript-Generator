import express from "express"
import cors from "cors"
import routes from "./routes.js"
import dotenv from "dotenv";
dotenv.config();
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url) // returns the filename of the current module
const __dirname = path.dirname(__filename) // returns the directory(folder) name of the current module

const app = express()
const PORT = 8080

app.use(express.json())
app.use(cors())

// api endpoints
app.use("/api", routes)

// serve static files (HTML, JS, CSS, images etc) from the React frontend build directory
app.use(express.static(path.join(__dirname, "../frontend/dist")))

// handle client-side routing
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"))
})

// start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})