// Handles Users Posts
const {getUserData, addUserPoll, getPolls, pollChoice} = require("./model")
const express = require("express")
const postsRoute = express.Router()

postsRoute.route("/")
    .get(async (req, res) => {
        if(!req.session.signedIn){
            console.log("Redirecting to sign in page")
            return res.redirect(301, '../users/signin/?redirect=/posts')
        }
        
        let signedIn = req.session.signedIn
        
    
        let userData = await getUserData(signedIn)
        return res.render("pollsIdx.ejs", {signedIn, userData})
    })

    .post(async (req, res) => {
        console.log(req.body)
        const pollRes = await addUserPoll(req)
        return res.send(pollRes)
    })

postsRoute.route('/getPolls')
    .get(async (req, res) => {
        let category = req.query.cat
        const pollsRes = await getPolls(category)
        res.json(pollsRes)
    })
    .post(async (req, res) => {
        let result = await pollChoice(req)
        console.log(result)
        res.send("done")

    })


module.exports = {postsRoute}