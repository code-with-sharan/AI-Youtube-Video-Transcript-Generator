import express from "express"
const app = express()
import cors from "cors"
import routes from "./routes.js"
import dotenv from "dotenv";
dotenv.config();
const PORT = 8010

app.use(express.json())
app.use(cors())

// api endpoints
app.use("/api", routes)

// start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})