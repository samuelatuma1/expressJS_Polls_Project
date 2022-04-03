const express = require("express")
const { addUser, signInUser} = require("./model.js")
// For handling post requests
const {check, validationResult} = require("express-validator")
const {CSRF_Token} = require("./cookieValidation")
const { request } = require("express")

const route = express.Router()

route.route('/signup')
    .get((req, res) => {
    res.set("Content-Type", "text/html")
    res.status(201).render("signup.ejs")
})
    .post([
        check("username").isLength({min : 3})
            .withMessage("Username Must be at least 3 character length"),
        
        check("username").custom((value, {req}) => {
            if(value === req.body.password){
                throw new Error("Username and Passowrd must not match")
            }
            else{
                return value
            }
        }),
        check ('username').custom((value, {req}) => {
            let bad = '.,?-!`'
            for(let char of value){
                if(bad.includes(char)){
                    throw new Error("Includes forbidden character " + char)
                }
            }
            return value
        }),
        check('password').isLength({ min : 5}).withMessage("Password must be at least five characters long")
    ],
        async (req, res) => {
        let errs = validationResult(req).array()
        if(errs.length > 0){
        res.status(201).render("signup.ejs", {errs : errs})
        return 
        }
        const data = await addUser(req)
        res.status(201).render("signup.ejs", {msg : data})
    })

route.route("/signin")
    .get((req, res) => {
        const csrf_token = CSRF_Token()
        req.session.csrf = csrf_token
        res.status(200).render('signin.ejs',  { csrf_token})
    })
    .post([check('username').isLength({min : 1}).withMessage("Cannot submit empty username"), 
           check('password').isLength({ min : 1}).withMessage("Password must be at least 1 character Long!!"),
           check('username').custom((val, {req}) => {
               const badXters = ' ?.,!'
               for(let char of badXters){
                   if(val.includes(char)){
                       throw new Error("Bad Character")
                   }
               }
               return val
           }),
           check('csrf_token').custom((val, {req}) => {
               if (!(val === req.session.csrf)){
                    throw new Error("CSRF_TOKEN VERIFICATION Failed")
               }
               return val
           })
        ],async (req, res) => {
        

        // const csrf_token = CSRF_Token()
        // req.session.csrf = csrf_token

        const errs = validationResult(req).array()
        if(errs.length > 0){
            // console.log(errs)
            return res.status(400).render("signin.ejs", {errs})
        }
        // If no errs in submitted FormData, attempt sign in of user
        const userDetails = JSON.parse(await signInUser(req))
        console.log(userDetails)
        console.log(req.session.signedIn)

        // if no existing user
        if(!userDetails.user){
            return res.render('signin.ejs', {dbRes : 'invalid Username' })
        }
        // Wrong Password
         else if(userDetails.user === 'wrong Password'){
            return res.render('signin.ejs', {dbRes : 'Wrong Password' })
        }
        res.cookie("signedIn", req.session.signedIn)
        if(req.query.redirect){

            
            return res.redirect(301, req.query.redirect)
            
        }
        return res.redirect('./home')
    })

route.route('/home')
    .get((req, res) => {
        return res.status(200).render("guess", { user : req.session.signedIn || 'anonymous'})
        
    })




module.exports = route