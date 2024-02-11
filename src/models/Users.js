import { Schema, model } from "mongoose"

const userSchema = new Schema({
    googleId: {
        type: String,
        required: false,
    },
    name: {
        type: String,
        required: true,
    },
    surname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: function () {
            return this.googleId ? false : true
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

export default model("User", userSchema)
