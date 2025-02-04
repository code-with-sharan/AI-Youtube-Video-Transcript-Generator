import express from "express"
const app = express()
import cors from "cors"
import routes from "./routes.js"
import dotenv from "dotenv";
dotenv.config();

app.use(express.json())
app.use(cors())
const PORT = 8090

// api endpoints
app.use("/api", routes)

// start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})