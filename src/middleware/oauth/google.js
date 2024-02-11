import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import Users from "../../models/Users.js"

const googleStrategy = new GoogleStrategy(
    {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL,
    },
    async function (_, __, profile, cb) {
        let user = await Users.findOne({ googleId: profile.id })

        if (!user) {
            user = await Users.create({
                googleId: profile.id,
                name: profile.name.givenName,
                surname: profile.name.familyName,
                email: profile.emails[0].value,
            })
        }
        cb(null, user)
    }
)

export default googleStrategy
