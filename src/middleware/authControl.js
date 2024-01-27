import jwt from "jsonwebtoken"
import User from "../models/Users.js"

const authControl = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const payload = jwt.verify(token, process.env.JWT_SECRET)

        req.user = await User.findById(payload.userId).select("-password")

        if (!req.user) {
            return res.status(404).json({ message: "User not found" })
        }

        next()
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" })
    }
}

export default authControl
