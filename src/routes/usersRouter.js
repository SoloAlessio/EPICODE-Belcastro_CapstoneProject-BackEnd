// Importing required modules
import express from "express"
import User from "../models/Users.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import authControl from "../middleware/authControl.js"
import passport from "passport"

// Creating an instance of express router
const usersRoute = express.Router()

usersRoute

    // Handling get route
    .get("/me", authControl, async (req, res) => {
        const user = await User.findOne({ email: req.user.email }).select(
            "-password"
        )
        res.status(200).json(user)
    })

    // Handling update route
    .put("/me", authControl, async (req, res) => {
        const id = req.user._id
        const { email, name, surname } = req.body

        try {
            const updatedUser = await User.findByIdAndUpdate(
                id,
                { email, name, surname },
                { new: true }
            )
            res.status(200).json(updatedUser)
        } catch (error) {
            res.status(500).send("Failed to update user")
        }
    })

    // Handling delete route
    .delete("/me", authControl, async (req, res) => {
        const id = req.user._id
        try {
            await User.findByIdAndDelete(id)
            res.status(204).send("User deleted")
        } catch (error) {
            res.status(500).send("Failed to delete user")
        }
    })

    // Handling login route
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

        const payload = {
            userId: user._id,
            name: user.name,
            surname: user.surname,
            email: user.email,
        }
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

    // Google OAuth login
    .get(
        "/login/oauth-google",
        passport.authenticate("google", {
            scope: ["profile", "email"],
            prompt: "select_account",
        })
    )

    // Handling callback after Google OAuth authentication
    .get(
        "/login/oauth-callback",
        passport.authenticate("google", {
            failureRedirect: "/login",
            session: false,
        }),
        async (req, res) => {
            const payload = {
                id: req.user._id,
                name: req.user.name,
                surname: req.user.surname,
                email: req.user.email,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET)

            res.redirect(`${process.env.SITE_URL}/callbackPage?token=${token}`)
        }
    )

// Exporting the usersRoute
export default usersRoute
