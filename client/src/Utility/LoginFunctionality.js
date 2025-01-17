const DBconn = require("./config/database_handler");
//const bcrypt = require('bcrypt');

async function login(req, res) {
    req.session.loggedin = false;
    let usr = req.body.username;
    let pwd = req.body.password;
    if (usr && pwd) {
        const UserCollection = database.collection("Users");
        const Users = await UserCollection.find({ email: usr, password: pwd }).toArray();
        if (Users.length == 1) {
            try {
                // const salt = bcyrpt.genSalt() //
                // const hashedPassword = await bcyrpt.hash(Users[0].password, salt)
                //if (await bycrypt.compare(pwd, Users[0].password)) {
                req.session.loggedin = true;
                req.session.username = usr;
                res.redirect("/home")
                //res.setHeader('Home', '/home')
                res.end();
                //return;
                //}
            } catch {
                res.status(418).send()
            }

        } else {
            res.send('Incorrect Username and/or Password!');
        }
        res.end();
    } else {
        res.send('Please enter Username and Password!');
        res.end();
    }
}

async function register(req, res) {
    try {
        const salt = bcrypt.genSalt() //
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        db.collection("Users").insertOne({
            "first_name": req.body.firstname,
            "last_name": req.body.lastname,
            "email": req.body.email,
            "password": req.body.password,
            //"password" : hashedPassword,
            "business": req.body.business
        });
        res.redirect("/login")
        //res.setHeader('Login', '/login')
        //res.status(201).send() // not sure what this does
    } catch {
        res.status(418).send()
        //res.status(500).send()
    }
}

function home(req, res) {
    if (req.session.loggedin) {
        res.send("HI")
        //res.sendFile(__dirname + '/home.html');
    } else {
        //res.sendFile(__dirname + '/login.html');
        res.send('Please login to view this page!');
    }
    res.end();
}

function logout(req, res) {
    req.session.destroy((error) => {
        if (error) throw error;
        res.redirect('/')
    });
};

module.exports = { login, home, logout, register };