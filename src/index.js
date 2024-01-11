import express from "express"
import list from "express-list-endpoints"
import mongoose from "mongoose"
import usersRoute from "./routes/usersRouter.js"
import { config } from "dotenv"
import cors from "cors"
config()

const server = express()
const port = process.env.PORT || 3030

server.use(cors())
server.use(express.json())

server.use("/users", usersRoute)

const initServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("🌚 The server has successfully connected to mongodb.")

        server.listen(port, () => {
            console.log(
                "🚀 Server listening to port: " +
                    port +
                    "!" +
                    "\n🌝 The server has these endpoints: \n"
            )
            console.table(list(server))
        })
    } catch (error) {
        console.log("❌ CONNECTION FAILED! Error: ", error)
    }
}

initServer()
