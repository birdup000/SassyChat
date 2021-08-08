const { authenticate } = require("passport")



const LocalStrategy = required('passport-local').Strategy
const bcrypt = require('bcrypt')


function initialize(passport) {
    const authenticateUser = (email, password, done) =>{
   const user = getUserByEmail(email)
   if (user == null) {
      return done(null, false, { message: 'No user with that email'})
   }

    }

    passport.use(new LocalStrategy({usernameField: 'email'}), 
 authenticateUser)
 passport.serializeUser((user, done) => {  })
 passport.deserializeUser((id, done) => {  })
}