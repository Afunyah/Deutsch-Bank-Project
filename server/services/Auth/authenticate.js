const database = require("../../config/database_handler");
const bcrypt = require('bcrypt');
const mappingUtils = require("../mrs/mappingUtils");
const { ObjectId } = require("mongodb");
const jwt = require('jsonwebtoken')
const key = require('../../config/api-key.json')

const collection = "Users";

function generateAccessToken(username) {
    return jwt.sign(username, key['key'])
}

async function login(req, res) {
    req.session.loggedin = false;
    let usr = req.body.username;
    let pwd = req.body.password;
    
    if (database == null) {
        res.status(503).send("Internal server error: unable to connect to the database")
    } else {
        if (usr && pwd) {
            const UserCollection = await database.fetchDB().collection(collection);
            var User = await UserCollection.find({email: usr}).toArray();

            if (User.length == 1) {
                
                const validPassword = await bcrypt.compare(pwd, User[0].password);
                var watchlistNames = await UserCollection.find({ email: req.body.username }).project({watchlist: 1, _id: 0}).toArray();
                
                var watchlist = await mappingUtils.getTagsFromNames(watchlistNames[0]['watchlist']);

                var mentor = await database.fetchDB().collection("MentoringStatus").find( {mentee: ObjectId(User[0]._id), "status": {"$ne" : "Ended"}} ).toArray();
                var mentees = await database.fetchDB().collection("MentoringStatus").find( {mentor: ObjectId(User[0]._id), "status" : {"$ne" : "Ended"}} ).project({ mentee: 1, _id: 0}).toArray();
                var mentorId;
                var mentorStatus;

                
                if (mentor.length) {
                    mentorStatus = mentor[0].status;
                    if (mentorStatus === "Set") {
                        mentorId = mentor[0].mentor;
                    }
                    else {
                        mentorId = null;
                    }
                }
                else {
                    mentorStatus = null;
                    mentorId = null;
                }
                if (validPassword) {
                    var mentoringObject = {
                        "mentorId": mentorId,
                        "mentorStatus": mentorStatus,
                        "menteeArray": mentees
                    }
                    req.session.loggedin = true;
                    req.session.username = usr;
                    res.status(200);
                    res.cookie('jwtToken', 'Bearer ' + generateAccessToken(usr), {maxAge : 3600000 * 168 * 2, httpOnly : true})
                    res.send({result: 1, user: User[0], watchlist: watchlist, mentorsAndTees: mentoringObject});
                } else {
                    res.status(401);
                    res.json({result: 0, message: "Invalid username or password"});
                }
            } else {
                res.status(401);
                res.json({result: 0, message: "Invalid username or password"});
            }
            res.end();
        } else {
            res.status(400);
            res.json({result: 0, message: "Username or password blank"});
            res.end();
        }
    }
    
    
}

async function register(req, res) {
    //console.log(req.body);
    let plaintxtpassword = req.body.password;
    let user_email = req.body.email
    if (database == null) {
        res.status(503).send("Internal server error: unable to connect to the database")
    } else {
        try {
            const UserCollection = await database.fetchDB().collection(collection);
            var User = await UserCollection.find({email: user_email}).toArray();
            if (User.length != 0) {
                res.status(404)
                res.json({result : 0, message: "A user with that email already exits"})
            } else {
                const salt = await bcrypt.genSalt(10);
                const hashedpassword = await bcrypt.hash(plaintxtpassword, salt);
                //console.log(salt, hashedpassword);
                await database.fetchDB().collection(collection).insertOne({
                    "first_name": req.body.first_name,
                    "last_name": req.body.last_name,
                    "email": user_email,
                    "password" : hashedpassword,
                    "business": req.body.business,
                    "aoe": req.body.aoe,
                    "watchlist": [],
                    "interests": [],
                    "isMentor": req.body.isMentor,
                    "branch": req.body.branch,
                    "AvgRating" : 2.5
                });
                req.session.loggedin = true;
                var User = await UserCollection.find({email: user_email}).toArray();
                res.status(201);
                res.cookie('jwtToken', 'Bearer ' + generateAccessToken(user_email), {maxAge : 3600000 * 168 * 2, httpOnly : true})
                res.json({result : 1, user: User[0]})
            }
        } catch(err) {
            console.log(err)
            res.status(400).send()
            console.log("Register Exception")
        }
    }
        
}

function logout(req, res) {
    req.session.destroy((error) => {
        if (error) throw error;
        console.log('User logout')
        res.redirect('/')
    });
};

module.exports = { login, logout, register };