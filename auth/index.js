const passportJWT = require('passport-jwt')
const dotenv = require('dotenv')
const User = require('../models/user')
dotenv.config()

const jwtOptions = {
    secretOrKey: process.env.JWT_KEY,
    jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
}

exports.strategy = new passportJWT.Strategy(
    jwtOptions,
    async (jwt_payload, next) => {
        console.log('payload received', jwt_payload)
        const email = jwt_payload.email
        const user = await User.findByPk(email)
        if (user) {
            //Add 1 so we round the issue time up, rather than rounding down
            const tokenIssueTime = new Date(
                (parseInt(jwt_payload.iat) + 1) * 1000
            )
            const tokenValidFromTime = new Date(user.tokenValidity)
            //Check token was issued at or after the last time the user logged out from all sessions
            //TODO: V2, would be nice to implement this check without a database lookup
            if (tokenIssueTime.getTime() >= tokenValidFromTime.getTime()) {
                console.log(`Auth successful for ${user.email}`)
                return next(null, user)
            } else {
                console.log(`Token no longer valid`)
            }
        }
        console.log('auth failed', jwt_payload)
        return next(null, false)
    }
)
