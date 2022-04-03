const users = require('./users.json')
const fs = require("fs")
const { request } = require('http')
const {sort_by_date} = require("./utils")
const { resolve } = require('path')
let example = {
    "users" : {
        "sam":{"password":"125",
                "polls":[
                {
                    "question":"The qstn","pollOptions":["A","B"],
                    "category":"sports",
                    "votes":{},
                    "date":"2022-04-03"
                }
            ] 
        }
    },
     "polls" : []

}

const pollChoice = (req) => {
    return new Promise ((res, rej) => {
        let formData = req.body
        let signedInUser = req.session.signedIn || req.cookies.signedIn

        // Get poll for which user made a choice
        let authorPolls = users.users[formData.author].polls
        for(let poll of authorPolls){
            if (poll.question === formData.qst ){
                // if found, update votes
                poll.votes[signedInUser] = formData.choice
            }
        }
        users.users[formData.author].polls = authorPolls
        fs.writeFile(__dirname + '/users.json', JSON.stringify(users), (err) => {
            if(err) console.log(err)
            res("updated")
        })
    })
}
/**
 * @param {String} category : -> String representation of the poll category user wants
 * @returns {Object} a date sorted array of polls and their author e.g [{author : 'sam', 
 *                                                      poll : {"question":"The qstn","pollOptions":["A","B"],"category":"sports","votes":{},"date":"2022-04-03"}}, ...]
 */
const getPolls = (category) => {
    return new Promise((res, rej) => {
        const querySet = []
        for(let [author, data] of Object.entries(users.users)){
            let userPolls = data.polls
            for(let poll of userPolls){
                if(poll.category === category){
                    querySet.push({author, poll})
                }
            }
        }
        let result = sort_by_date(querySet)
        console.log(result)
        res(result)
    })
}


let pollExample = {
    question: 'what is your Poll question',
    pollOptions: [ 'chooseable option', 'chooseable option2' ]
  }


/**
 * Adds a poll to the signed In user Polls Poll may look like pollExample = {
    question: 'what is your Poll question',
    pollOptions: [ 'chooseable option', 'chooseable option2' ]
  }
 * @param {Object} req : -> The request object
 * @returns {Promise} :-> Returns a string promise 
 */
const addUserPoll = (req) => {
    return new Promise((res, rej) => {
        const user = req.cookies["signedIn"] || request.session.signedIn
        if(!users.users.hasOwnProperty(user)){
            return res("Error. No existing User")
        }
        pollsData = {...req.body, votes : {}, date : new Date()}
        users.users[user].polls.push(pollsData)

        fs.writeFile(__dirname + '/users.json', JSON.stringify(users), (err) => {
            if (err) console.log(err)
            return res("Poll added successfully")
        })
        
    })
}
/**
 * @param {String} username : -> signedIn User name
 */
const getUserData = (username) => {
    return new Promise((res, rej) => {
        let userData = users.users[username]  || null;
        return res(JSON.stringify(userData))
    }) 

}

const signInUser = (req) => {
     return new Promise((resolve, reject) => {
        const username = req.body.username
        const password = req.body.password
        
        if(!users.users.hasOwnProperty(username)){
            return resolve(JSON.stringify({user : null}))    
        }
        if(users.users[username].password === password){
            let user = users.users[username]
            
            req.session.signedIn = username
            return resolve(JSON.stringify({ user}))
        }
        return resolve(JSON.stringify({user : 'wrong Password'}))


     })
 }


const addUser = (req) => {
    return new Promise((resolve, reject) => {
        let username = req.body.username
        let password = req.body.password
        if(!username || !password){
            resolve("Cannot have empty username or password")
        }
        if(users.users.hasOwnProperty(username)){
            resolve("User already exists")
        }
        else{
            users.users[username] = {
                password,
                polls : []
            }

            fs.writeFile(__dirname + '/users.json', JSON.stringify(users), (err) => {
                if(err) console.log(err);
                resolve("User added Successfully")
            })
        }
    })
}


module.exports = { addUser, signInUser, getUserData, addUserPoll, getPolls, pollChoice }