// Importing required modules
import express from "express"
import User from "../models/Users.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import authControl from "../middleware/authControl.js"

// Creating an instance of express router
const usersRoute = express.Router()

// Handling login route
usersRoute
    .get("/me", authControl, async (req, res) => {
        const user = await User.findOne({ email: req.user.email }).select(
            "-password"
        )
        res.status(200).json(user)
    })
    .post("/login", async (req, res) => {
        const { email, password } = req.body
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(401).send("Invalid email or password")
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(401).send("Invalid email or password")
        }

        const payload = { userId: user._id, name: user.name, email: user.email }
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "1h",
        })
        const response = { token: token, user: payload }

        // Authentication successful
        res.status(200).send(response)
    })

    // Handling register route
    .post("/register", async (req, res) => {
        const password = await bcrypt.hash(req.body.password, 10)
        if (!password) {
            res.status(400).send("Password is required")
        }
        const user = await User.findOne({ email: req.body.email })
        if (user) {
            res.status(400).send("User already exists")
        }
        const newUser = await User.create({ ...req.body, password: password })
        res.status(201).send(newUser)
    })

// Exporting the usersRoute
export default usersRoute
