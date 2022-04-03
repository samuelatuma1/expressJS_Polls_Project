// A simple voting application
const express = require("express")
const fs = require("fs")
const path = require("path")
const voteCount = require("./votes.json")

const user = require("./user")
const {postsRoute} = require("./posts")
const cookieParser = require("cookie-parser")
const {check, validationResult} = require("express-validator")
const session = require("express-session")

const app = express()

app.use(session(
    {"secret" : "hekko", 
    resave : false,
    saveUninitialized : false,
    cookie : {maxAge : 600000}}
))
app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cookieParser())
app.set('view engine', 'ejs')

let parties = ["apc", "pdp", "anpp", "adc"]
let users = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const middleWareUser = (req, res, next) => {
    if(req.cookies.user){
        const randIdx = Math.floor(Math.random() * users.length)
        res.cookie("user", JSON.stringify(users[randIdx]))
        console.log(req.cookies)

    }
    next()
}
// app.use()
app.route('/vote')
    .get(middleWareUser, (req, res) => {
        const user = req.cookies.user || "anonymous"
        res.set("Content-Type", "text/html")
        res.render("vote", {parties, user})
    })
    .post([check('userId').isLength({ min : 2}).withMessage("minimum length is 3")], (req, res) => {
        let userId = req.body.userId
        let vote = req.body.vote
        let msg;

        const errs = validationResult(req).array()
        if(errs.length > 0){

            res.json(errs)
        }

        console.log(req.session.votes)
        let sessionVotes = req.session.votes || {}
        sessionVotes = sessionVotes
        if(sessionVotes.hasOwnProperty(userId)){
            msg = 'Voter already Voted'
        }
        else{
            sessionVotes[userId] = vote
            msg = 'Voter successfully Voted'
        }
        req.session.votes = sessionVotes
        
        res.render("vote", {parties, msg})
        
    })


    app.get("/voteRes", (req, res) => {
        console.log ("Votes =>", req.session.votes)
        let result = {}
        //  Count Votes
        const all_votes = req.session.votes ? Object.entries(req.session.votes) : []
        for(let [voter, party] of all_votes){
            if(!result.hasOwnProperty(party)){
                result[party] = 1
            }else{
                result[party] += 1
            }

        }
        voteCount.voteRes = JSON.stringify(result)
        console.log(result)
        fs.writeFile(path.join(__dirname, 'votes.json'), JSON.stringify(voteCount), (err) => {
            if(err) {console.log(err)}
            console.log("cvote counted")
            // res.redirect('/result')
        })
        
    })

    
    app.get("/result", (req, res) => {
        console.log(req.query)
        res.send("Votes Counted")
    })

app.use('/users', user)
app.use('/posts', postsRoute)

const port = process.env.PORT || 8000

app.listen(port, () => console.log("Listening on Port : " + port))