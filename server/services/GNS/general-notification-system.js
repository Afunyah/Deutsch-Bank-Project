const database = require("../../config/database_handler");
const {ObjectId} = require("mongodb")

const connectedUsers = {} 

/**
 * Start the socket to listen on 3002
 */
function startSocket() {
    const WSPORT = 3002;
    const webSocketServer = require('websocket').server;
    const http = require('http');

    const server = http.createServer();
    server.listen(WSPORT);

    const wsServer = new webSocketServer({
        httpServer: server
    });
    //console.log(`Successfully started websocket on ${WSPORT}`)

    wsServer.on('request', (req) => {

        const connection = req.accept(null, req.origin);
        var connectedUser = null;

        connection.on('message', (message) => {
            var data = JSON.parse(message.utf8Data);
            
            if (data.type == "onfirstlogin") {
                connectedUser = data.id;
                connectedUsers[connectedUser] = connection;
                //console.log(`User logged in: ${data.id}`)
            }
            //console.log(`CONNECTED USERS: ${Object.keys(connectedUsers).length}`)
        })

        connection.on('close', (connection) => {
            delete connectedUsers[connectedUser]
            //console.log(`${connectedUser} disconnected.`)
        })

    })
}

/**
 * Send the body to the user over the GNS websocket 
 * @param {String} user 
 * @param {Alert} body 
 */
function sendAlertViaSocket(user, body) {
    if (typeof connectedUsers[user] != "undefined") {
        connectedUsers[user].sendUTF(JSON.stringify(body)) 
    }
}

/* 
The general structure of each Alert is shown below:
the URL array contains an array of 3001 endpoints about the various actions that can be taken
Alert = {
    user_associated: _ObjectID,
    message: String
    type: String
    details : {

    }
}

Type of alerts: general notification, meeting notification, accept/reject mentor
*/

/**
 * Insert the alertArray to the database
 * @param {[Alert]} alertArray 
 * @returns 
 */
async function addAlerts(alertArray) {
    try {
        database.fetchDB().collection("Alerts").insertMany(alertArray);
        return true
    }
    catch(err) {
        throw(err);
    }
}

/**
 * Returns all the alerts for the user
 * @param {String} userAssociated 
 * @returns 
 */
async function getAlerts(userAssociated) {
    try {
        alerts = await database.fetchDB().collection("Alerts").find( {"user_associated" : {"$eq" : ObjectId(userAssociated)}} ).toArray();
        return alerts;
    } catch {
        throw(err)
    }
}

module.exports = {
    addAlerts, 
    getAlerts,
    startSocket,
    sendAlertViaSocket
}