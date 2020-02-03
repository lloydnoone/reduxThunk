const passport = require('passport')
const User = require('../models/user')
const config = require('../config')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const LocalStrategy = require('passport-local')

//create local strattgy
const localOptions = { usernameField: 'email' }
const localLogin = new LocalStrategy(localOptions, function(email, password, done) {
  //verify this eamil and password, call done with the user
  // if it is the correct email and passwrod
  // otherwise, call done with false
  User.findOne({ email: email }, function(err, user) {
    if (err) return done(err)
    if (!user) return done(null, false)

    //compare password - is password equal to user.password?
    user.comparePassword(password, function(err, isMatch) {
      if (err) return done(err)
      if (!isMatch) return done(null, false)

      return done(null, user)
    })
  })
})

//setup options for JWT strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: config.secret
}

// create jwt strategy
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
  //seee if userUd in the payload exist in out datav=base
  // if it does call done with that user
  // otherwise, call done without a user object
  User.findById(payload.sub, function(err, user) {
    if (err) return done(err, false)

    if (user) {
      done(null, user)
    } else {
      done(null, false)
    }
  })
})

//tell passport to use this strategy
passport.use(jwtLogin)
passport.use(localLogin)