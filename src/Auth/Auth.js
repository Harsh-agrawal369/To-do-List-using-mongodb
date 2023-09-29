const passport = require("passport");
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const dotenv = require("dotenv");
const Register = require("../models/Register");
const jwt = require("jsonwebtoken");

dotenv.config();

const CreateToken = (id) => {
    return jwt.sign({id}, process.env.COOKIESESSIONKEY, {
        expiresIn: 12 * 60 * 60
    });
}




if(process.env.DEPLOYMENT_STATUS == "development"){
    passport.use(new GoogleStrategy(
        {
        clientID:     process.env.GOOGLE_CLIENT_ID_DEVELOPMENT,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET_DEVELOPMENT,
        callbackURL: "http://localhost:5000/auth/google/callback",
        passReqToCallback   : true,
        scope: ['email', 'profile', 'https://www.googleapis.com/auth/user.phonenumbers.read']
    },
    function(req, accessToken, refreshToken,profile, done) {
        // return done(null,profile);
        // const userProfile = profile._json();
        // console.log(profile.phone_number);
        Register.findOne({ email: profile.email })
            .then(user => {
                if (user) { 
                    return done(null, user);
                } else {
                    // console.log(profile);
                    // Create a new user if it doesn't exist
                    new Register({ email: profile.email, name: profile.displayName, gender: profile.gender, contact: profile.phone_number }).save()
                        .then(user => {
                            return done(null, user);
                        })
                        .catch(err => done(err));
                }
            })
            .catch(err => done(err));
    }
    ));
    
} 

else if(process.env.DEPLOYMENT_STATUS == "Production"){

    passport.use(new GoogleStrategy(
        {
        clientID:     process.env.GOOGLE_CLIENT_ID_PRODUCTION,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET_PRODUCTION,
        callbackURL: "https://to-do-list-6thr.onrender.com/auth/google/callback",
        passReqToCallback   : true,
        scope: ['email', 'profile', 'https://www.googleapis.com/auth/user.phonenumbers.read']
    },
    function(req, accessToken, refreshToken,profile, done) {
        // return done(null,profile);
        // const userProfile = profile._json();
        // console.log(profile.phone_number);
        Register.findOne({ email: profile.email })
            .then(user => {
                if (user) {
                    return done(null, user);
                } else {
                    // console.log(profile);
                    // Create a new user if it doesn't exist
                    new Register({ email: profile.email, name: profile.displayName, gender: profile.gender, contact: profile.phone_number || ''}).save()
                        .then(user => {
                            return done(null, user);
                        })
                        .catch(err => done(err));
                }
            })
            .catch(err => done(err));
    }
    ));
}


passport.serializeUser((user, done) => {
    try {
        done(null,user._id );
    } catch (err) {
        console.log(err);
        done(err);
    }
});



passport.deserializeUser((id, done) => {
    Register.findById(id).then((user) => {
        done(null, user);
    });
});


