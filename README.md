# CS261 Software Engineering Group 28

## Installation

1. Set up the front end: `cd` into `client` and run `npm install`
2. Set up the server: `cd` into `server` and run `npm install`

## To start up the client and server:

1. Run `npm start` in the `server` folder. This should start it on port 3001
2. Run `npm start` in the `client` folder. This should run on port 3000

## Common issues:
### TextEncoder errors
Update your npm and/or node. The repository works fine on `npm` version 6.14.15 and 8.1.2 and `node` version 14.5.0 and 16.13.1. 

### Can't connect to database
Add the X509 certificate to the `server/config` path. 

### 401 Unauthorised when accessing localhost:3001/api
Add the `api-key.json` file to the `client/src` folder as well as the `server/config` folder. 
You will have to include the API key in the `api-key` header in each request you make to the server. The server will **reject** any request made to any `/api/*` endpoint without the appopriate API key.
Contact me (Sid) if you have any queries regarding this. 

### Proxy errors
Make sure that port 3000, 3001 and 3002 are free. The client runs on 3000, server on 3001 and websocket on 3002. 

## Logging in:
Currently, our database is populated with over 180 characters from Harry Potter that can be used to log in. All of them have been randomly assigned between 4 and 7 developmental interests; 50% are mentors with between 4 and 7 areas of expertise. The log-in for each character is as below:

Email address: First Letter of Email, followed by Last name, @ hogwarts.ac.uk
Password: Firstname + Lastname

Example users:

Email : RWeasley@hogwarts.ac.uk
Password : RonaldWeasley

Email : HGranger@hogwarts.ac.uk
Password : HermioneGranger

Email : Dobby@hogwarts.ac.uk
Password : Dobby

Email : RLupin@hogwarts.ac.uk
Password: RemusLupin