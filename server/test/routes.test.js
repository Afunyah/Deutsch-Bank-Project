const request = require("supertest");
const assert = require("assert");
var chai = require("chai");
const { server, app } = require("../index");
const database = require("../config/database_handler");

const key = require("../config/api-key.json");
const { ObjectId } = require("mongodb");
const { expect } = require("chai");
chai.use(require("chai-as-promised"));

before((done) => {
  app.on("app_started", () => done());
});

describe("Presence of API key", () => {
  after(() => {
    server.close();
  });

  it("No API Key throws 401", (done) => {
    request(app).get("/api").expect(401, done);
  });

  it("Correct API key gives 200", async () => {
    const response = await request(app)
      .get("/api/")
      .set({ "api-key": key["key"] });

    // Check that we get a 200 and get the right message
    assert.equal(response.status, 200);
    assert.equal(response.body.message, "API key found and correct");

    //expect(response.status).toBe(200)
    //expect(response.body.message).toBe("API key found and correct");
  });
});

describe("User related endpoints", () => {
  after(() => {
    server.close();
  });

  it("Registering a new user gives 200", async () => {
    var user = {
      first_name: "Test firstname",
      last_name: "Test lastname",
      email: "test@test.com",
      password: "testingthepassword",
      business: "Testing business",
      aoe: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
      isMentor: true,
      branch: "Coventry",
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(user)
      .set({ "api-key": key["key"] });

    assert.equal(response.status, 201);
    assert.equal(response.body.result, 1);
  });

  it("Log in with correct credentials is accepted", async () => {
    // Get the user id of the user that we just entered
    const response = await request(app)
      .post("/api/auth/login")
      .send({ username: "test@test.com", password: "testingthepassword" })
      .set({ "api-key": key["key"] });

    assert.equal(response.status, 200);
    assert.equal(response.body.result, 1);
  });

  it("Log in with incorrect credentials is rejected", async () => {
    // Get the user id of the user that we just entered
    const response = await request(app)
      .post("/api/auth/login")
      .send({ username: "test@test.com", password: "theincorrectpassword" })
      .set({ "api-key": key["key"] });
    assert.equal(response.status, 401);
  });

  it("Get user endpoint gets the correct user", async () => {
    // Get the user id of the user that we just entered
    var user = await database
      .fetchDB()
      .collection("Users")
      .find({ first_name: "Test firstname" })
      .toArray();
    user = user[0];

    // Ask the API for the user details of the user that we just entered
    const response = await request(app)
      .get("/api/user/" + user["_id"] + "")
      .set({ "api-key": key["key"] });

    // Check that the reponse we get from the API is the same as the database
    assert.equal(response.status, 200);
    assert.equal(response.body.first_name, "Test firstname");
    assert.equal(response.body.last_name, "Test lastname");
    assert.equal(response.body.email, "test@test.com");
    assert.equal(response.body.business, "Testing business");
  });

  it("Update user endpoint updates correctly", async () => {
    var user = await database
      .fetchDB()
      .collection("Users")
      .find({ first_name: "Test firstname" })
      .toArray();
    user = user[0]["_id"] + "";

    const response = await request(app)
      .put("/api/user/" + user)
      .set({ "api-key": key["key"] })
      .send({ business: "Updated business" });

    // Get the updated user from the database
    var user2 = await database
      .fetchDB()
      .collection("Users")
      .find({ _id: ObjectId(user) })
      .toArray();
    user2 = user2[0];

    assert(response.status, 200);
    assert(user2.business, "Updated business");
  });

  it("Delete user endpoint", async () => {
    var user = await database
      .fetchDB()
      .collection("Users")
      .find({ first_name: "Test firstname" })
      .toArray();
    user = user[0]["_id"] + "";

    const response = await request(app)
      .delete("/api/user/" + user)
      .set({ "api-key": key["key"] });

    const user2 = database
      .fetchDB()
      .collection("Users")
      .find({ _id: ObjectId(user) })
      .toArray();

    // Assert that we got a successful response and that the user with id we just deleted returns an array of length 0
    assert(response.status, 200);
    expect(user2).to.eventually.deep.equal([]);
  });
});

describe("Alert endpoints", () => {
  var user_id = "";

  before(async () => {
    // Create a new user that we will test on
    var user = {
      first_name: "Test firstname",
      last_name: "Test lastname",
      email: "test@test.com",
      password: "testingthepassword",
      business: "Testing business",
      aoe: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
      isMentor: true,
      branch: "Coventry",
    };

    await database.fetchDB().collection("Users").insertOne(user);

    var temp = await database
      .fetchDB()
      .collection("Users")
      .find({ first_name: "Test firstname", email: "test@test.com" })
      .toArray();
    user_id = temp[0]["_id"] + "";
  });

  after(async (done) => {
    database
      .fetchDB()
      .collection("Users")
      .deleteOne({ _id: ObjectId(user_id) });
    database
      .fetchDB()
      .collection("Alerts")
      .deleteMany({ user_associated: ObjectId(user_id) });
    done();
  });

  it("Creating a new alert gives 200", async () => {
    var alert = {
      sender: "198273981273",
      user_associated: user_id,
      message: "This is an automated test lol",
      type: 69,
      details: null,
    };

    const response = await request(app)
      .post("/api/alerts/")
      .send({ alert: alert })
      .set({ "api-key": key["key"] });

    assert(response.status, 200);
  });

  it("Get alerts for user", async () => {
    const response = request(app)
      .get("/api/alerts/" + user_id)
      .set({ "api-key": key["key"] });

    expect(response).to.eventually.have.length(1);
  });
});

describe("Milestone Related Endpoints", () => {
  var user_id = "";
  before(async () => {
    // Create a new user that we will test on
    var user = {
      first_name: "Test firstname",
      last_name: "Test lastname",
      email: "test@test.com",
      password: "testingthepassword",
      business: "Testing business",
      aoe: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
      isMentor: true,
      branch: "Coventry",
    };

    await database.fetchDB().collection("Users").insertOne(user);

    var temp = await database
      .fetchDB()
      .collection("Users")
      .find({ first_name: "Test firstname", email: "test@test.com" })
      .toArray();
    user_id = temp[0]["_id"] + "";
  });

  after(async (done) => {
    database
      .fetchDB()
      .collection("Users")
      .deleteOne({ _id: ObjectId(user_id) });
    database
      .fetchDB()
      .collection("Milestones")
      .deleteMany({ user_associated: ObjectId(user_id) });
    done();
  });

  it("Adding a new Milestone gives 200", async () => {
    var message = "Test Milestone";

    const response = await request(app)
      .post("/api/milestones")
      .send({ user_associated: user_id, milestones: [message] })
      .set({ "api-key": key["key"] });

    assert.equal(response.status, 200);
  });

  it("Get milestone endpoint gets the correct milestone", () => {
    const response = request(app)
      .get("/api/milestones/" + user_id)
      .set({ "api-key": key["key"] });

    expect(response).to.eventually.have.length(1);
  });

  it("Update milestone endpoint updates correctly", async () => {
    const response = await request(app)
      .put("/api/milestones/" + user_id)
      .set({ "api-key": key["key"] })
      .send({ progress: "Complete" });

    // Get the updated user from the database
    var milestone = await database
      .fetchDB()
      .collection("Milestones")
      .find({ user_associated: ObjectId(user_id) })
      .toArray();
    milestone = milestone[0];

    assert(response.status, 200);
    assert(milestone.progress, "Complete");
  });

  it("Delete milestone endpoint", async () => {
    const response = await request(app)
      .delete("/api/milestones/" + user_id)
      .set({ "api-key": key["key"] });

    const milestone = database
      .fetchDB()
      .collection("Milestones")
      .find({ user_associated: ObjectId(user_id) })
      .toArray();

    // Assert that we got a successful response and that the user with id we just deleted returns an array of length 0
    assert(response.status, 200);
    expect(milestone).to.eventually.deep.equal([]);
  });
});

describe("Workshop Related Endpoints", () => {
  var user1_id;
  var user2_id;
  var temp_ws_id;
  var tag1;
  var tag2;
  var someDate = new Date();

  before(async () => {
    // var testBranch = {
    //     Name: "TestBranch",
    //     Locations: ["Kosmos", "Tartarus", "Slendheim"],
    //     Tags:[
    //             {
    //             _id: ObjectId("61f96e38d51386431418c38f"),
    //             Name: 'Public Speaking',
    //             Demand: {
    //               cumulative: 584,
    //               current: 288,
    //               watchlist: 138,
    //               N_predicted: 0,
    //               wsWatchers: [],
    //               wsRecommendedTo: [
    //               ]
    //             },
    //             Experts: [
    //             ],
    //             wsRecommended: true,
    //             index: 5
    //           },
    //           {
    //             _id: ObjectId("61f96f3b47eecc9c2e335cb5"),
    //             Name: 'Leadership',
    //             Demand: {
    //               cumulative: 500,
    //               current: 341,
    //               watchlist: 52,
    //               N_predicted: 999,
    //               wsWatchers: [ ObjectId("61fbe94482cced00e4ba214e") ],
    //               wsRecommendedTo: []
    //             },
    //             wsRecommended: false,
    //             Experts: [],
    //             index: 6
    //           },
    //           {
    //             _id: ObjectId("61f9705047eecc9c2e335cb8"),
    //             Name: 'Networking',
    //             Demand: {
    //               cumulative: 493,
    //               current: 404,
    //               watchlist: 114,
    //               N_predicted: 999,
    //               wsWatchers: [],
    //               wsRecommendedTo: []
    //             },
    //             Experts: [],
    //             wsRecommended: false,
    //             index: 10
    //           },
    //           {
    //             _id: ObjectId("6206799d62b715c8bedeb207"),
    //             Name: 'Career',
    //             Demand: {
    //               cumulative: 345,
    //               current: 49,
    //               watchlist: 8,
    //               N_predicted: 0,
    //               wsWatchers: [ ObjectId("61fbe94482cced00e4ba214e") ],
    //               wsRecommendedTo: []
    //             },
    //             Experts: [],
    //             wsRecommended: false,
    //             index: 0
    //           },
    //           {
    //             _id: ObjectId("62067b0d62b715c8bedeb208"),
    //             Name: 'Time Management',
    //             Demand: {
    //               cumulative: 648,
    //               current: 172,
    //               watchlist: 45,
    //               N_predicted: 0,
    //               wsWatchers: [],
    //               wsRecommendedTo: []
    //             },
    //             Experts: [],
    //             wsRecommended: false,
    //             index: 1
    //           },
    //           {
    //             _id: ObjectId("62067c8162b715c8bedeb209"),
    //             Name: 'Organisation',
    //             Demand: {
    //               cumulative: 0,
    //               current: 3,
    //               watchlist: 0,
    //               N_predicted: 0,
    //               wsWatchers: [],
    //               wsRecommendedTo: []
    //             },
    //             Experts: [],
    //             wsRecommended: false,
    //             index: 2
    //           },
    //           {
    //             _id: ObjectId("62067cc762b715c8bedeb20a"),
    //             Name: 'Presentations',
    //             Demand: {
    //               cumulative: 0,
    //               current: 2,
    //               watchlist: 3,
    //               N_predicted: 0,
    //               wsWatchers: [],
    //               wsRecommendedTo: []
    //             },
    //             Experts: [],
    //             wsRecommended: false,
    //             index: 3
    //           },
    //           {
    //             _id: ObjectId("62067cdb62b715c8bedeb20b"),
    //             Name: 'Work-Life Balance',
    //             Demand: {
    //               cumulative: 0,
    //               current: 2,
    //               watchlist: 3,
    //               N_predicted: 0,
    //               wsWatchers: [],
    //               wsRecommendedTo: []
    //             },
    //             Experts: [],
    //             wsRecommended: false,
    //             index: 4
    //           },
    //           {
    //             _id: ObjectId("62067d6162b715c8bedeb20d"),
    //             Name: 'Mental Health',
    //             Demand: {
    //               cumulative: 0,
    //               current: 2,
    //               watchlist: 5,
    //               N_predicted: 0,
    //               wsWatchers: [],
    //               wsRecommendedTo: []
    //             },
    //             Experts: [],
    //             wsRecommended: false,
    //             index: 7
    //           },
    //           {
    //             _id: ObjectId("62067d7e62b715c8bedeb20e"),
    //             Name: 'Communication',
    //             Demand: {
    //               cumulative: 0,
    //               current: 1,
    //               watchlist: 1,
    //               N_predicted: 0,
    //               wsWatchers: [],
    //               wsRecommendedTo: []
    //             },
    //             Experts: [],
    //             wsRecommended: false,
    //             index: 8
    //           },
    //           {
    //             _id: ObjectId("62067d9262b715c8bedeb20f"),
    //             Name: 'Data Analysis',
    //             Demand: {
    //               cumulative: 0,
    //               current: 2,
    //               watchlist: 1,
    //               N_predicted: 0,
    //               wsWatchers: [],
    //               wsRecommendedTo: []
    //             },
    //             Experts: [],
    //             wsRecommended: false,
    //             index: 9
    //           },
    //           {
    //             _id: ObjectId("62067dcc62b715c8bedeb211"),
    //             Name: 'Formal Writing',
    //             Demand: {
    //               cumulative: 0,
    //               current: 1,
    //               watchlist: 1,
    //               N_predicted: 0,
    //               wsWatchers: [],
    //               wsRecommendedTo: []
    //             },
    //             Experts: [],
    //             wsRecommended: false,
    //             index: 11
    //           },
    //           {
    //             _id: ObjectId("62067de162b715c8bedeb212"),
    //             Name: 'English',
    //             Demand: {
    //               cumulative: 0,
    //               current: 2,
    //               watchlist: 1,
    //               N_predicted: 0,
    //               wsWatchers: [],
    //               wsRecommendedTo: []
    //             },
    //             Experts: [],
    //             wsRecommended: false,
    //             index: 12
    //           },
    //           {
    //             _id: ObjectId("62067df162b715c8bedeb213"),
    //             Name: 'German',
    //             Demand: {
    //               cumulative: 0,
    //               current: 2,
    //               watchlist: 1,
    //               N_predicted: 0,
    //               wsWatchers: [],
    //               wsRecommendedTo: []
    //             },
    //             Experts: [],
    //             wsRecommended: false,
    //             index: 13
    //           },
    //           {
    //             _id: ObjectId("62067e0362b715c8bedeb214"),
    //             Name: 'Negotiation',
    //             Demand: {
    //               cumulative: 0,
    //               current: 2,
    //               watchlist: 0,
    //               N_predicted: 0,
    //               wsWatchers: [],
    //               wsRecommendedTo: []
    //             },
    //             Experts: [],
    //             wsRecommended: false,
    //             index: 14
    //           },
    //           {
    //             _id: ObjectId("62067e1962b715c8bedeb215"),
    //             Name: 'Research',
    //             Demand: {
    //               cumulative: 0,
    //               current: 2,
    //               watchlist: 0,
    //               N_predicted: 0,
    //               wsWatchers: [],
    //               wsRecommendedTo: []
    //             },
    //             Experts: [],
    //             wsRecommended: false,
    //             index: 15
    //           },
    //           {
    //             _id: ObjectId("62067e2f62b715c8bedeb216"),
    //             Name: 'Writing',
    //             Demand: {
    //               cumulative: 0,
    //               current: 1,
    //               watchlist: 0,
    //               N_predicted: 0,
    //               wsWatchers: [],
    //               wsRecommendedTo: []
    //             },
    //             Experts: [],
    //             wsRecommended: false,
    //             index: 16
    //           }
    //         ]
    // }

    tag1 = {
      _id: ObjectId("61f96f3b47eecc9c2e335cb5"),
      Name: "Leadership",
      Demand: {
        cumulative: 500,
        current: 341,
        watchlist: 52,
        N_predicted: 99,
        wsWatchers: [],
        wsRecommendedTo: [],
      },
      wsRecommended: false,
      Experts: [],
      index: 6,
    };

    tag2 = {
      _id: ObjectId("62067e2f62b715c8bedeb216"),
      Name: "Writing",
      Demand: {
        cumulative: 0,
        current: 1,
        watchlist: 0,
        N_predicted: 0,
        wsWatchers: [],
        wsRecommendedTo: [],
      },
      Experts: [],
      wsRecommended: false,
      index: 16,
    };

    var testBranch = {
      Name: "TestBranch",
      Locations: ["Kosmos", "Tartarus", "Slendheim"],
      Tags: [tag1],
    };

    var user1 = {
      first_name: "Test1 firstname",
      last_name: "Test1 lastname",
      email: "test1@test.com",
      password: "testingthepassword1",
      business: "Testing1 business",
      watchlist: ["Leadership", "Public Speaking", "Networking"],
      aoe: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
      isMentor: true,
      branch: "TestBranch",
    };

    var user2 = {
      first_name: "Test2 firstname",
      last_name: "Test2 lastname",
      email: "test2@test.com",
      password: "testingthepassword2",
      business: "Testing2 business",
      watchlist: ["Leadership", "Public Speaking", "Networking"],
      aoe: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
      isMentor: true,
      branch: "TestBranch",
    };

    await database.fetchDB().collection("Branches").insertOne(testBranch);
    var result1 = await database.fetchDB().collection("Users").insertOne(user1);
    var result2 = await database.fetchDB().collection("Users").insertOne(user2);
    user1_id = result1.insertedId;
    user2_id = result2.insertedId;

    // var temp = await database.fetchDB().collection("Users").find({"first_name" : "Test firstname", "email" : "test@test.com"}).toArray()
    // user_id = temp[0]['_id'] + ''
    // console.log(user_id);
  });

  it("Creating a new Workshop gives 200", async () => {
    const response = await request(app)
      .post("/api/workshops/createWorkshop")
      .send({
        tag: {
          _id: ObjectId("61f96f3b47eecc9c2e335cb5"),
          Name: "Leadership",
          Demand: {
            cumulative: 500,
            current: 141,
            watchlist: 51,
            N_predicted: 0,
            wsWatchers: [],
            wsRecommendedTo: [],
          },
          wsRecommended: false,
          Experts: [],
          index: 6,
        },
        name: "Test Leadership Workshop 1",
        capacity: 100,
        mentorIDs: [user1_id],
        details: {
          startDateTime: someDate,
          endDateTime: new Date(someDate.getTime() + 1000),
          location: "mxir/hc389dsa.io",
          isOnline: false,
          branch: "TestBranch",
        },
      })
      .set({ "api-key": key["key"] });

    assert.equal(response.status, 200);
  });

  it("Get Upcoming Workshops gives 200", async () => {
    const response = await request(app)
      .post("/api/workshops/workshopSel")
      .send({ userID: user2_id })
      .set({ "api-key": key["key"] });

    assert.equal(response.status, 200);
  });

  it("Booking a Workshop gives 200", async () => {
    var workshop = await database
      .fetchDB()
      .collection("Workshops")
      .findOne({ ExpertIds: { $all: [user1_id] } });

    temp_ws_id = workshop._id;

    const response = await request(app)
      .post("/api/workshops/bookAWorkshop")
      .send({ menteeID: user2_id, workshopID: temp_ws_id })
      .set({ "api-key": key["key"] });

    assert.equal(response.status, 200);
  });

  it("Get Booked Workshops gives 200", async () => {
    const response = await request(app)
      .post("/api/workshops/bookedWorkshops")
      .send({ menteeID: user2_id })
      .set({ "api-key": key["key"] });

    assert.equal(response.status, 200);
  });

  it("Un-Booking a Workshop gives 200", async () => {
    const response = await request(app)
      .post("/api/workshops/unbookAWorkshop")
      .send({ menteeID: user2_id, workshopID: temp_ws_id })
      .set({ "api-key": key["key"] });

    assert.equal(response.status, 200);
  });

  it("Updating a Watchlist gives 200", async () => {
    var response = await request(app)
      .post("/api/workshops/updateWatchlist")
      .send({
        menteeID: user2_id,
        branchName: "TestBranch",
        watchlist: [tag1, tag2],
      })
      .set({ "api-key": key["key"] });

    response = await request(app)
      .post("/api/workshops/updateWatchlist")
      .send({
        menteeID: user2_id,
        branchName: "TestBranch",
        watchlist: [tag2],
      })
      .set({ "api-key": key["key"] });

    assert.equal(response.status, 200);
  });

  it("Create Group Session gives 200", async () => {
    const response = await request(app)
      .post("/api/group/createGroupSession")
      .send({
        tag: tag1,
        Name: "GroupSess",
        menteeIds: [user2_id],
        mentor_id: user1_id,
        Details: {
          StartDateTime: someDate,
          EndDateTime: new Date(someDate.getTime() + 1000),
          Location: "mxir/hc389dsa.io",
          isOnline: false,
          Branch: "TestBranch",
        },
      })
      .set({ "api-key": key["key"] });

    assert.equal(response.status, 200);
  });

  after(async (done) => {
    database.fetchDB().collection("Branches").deleteOne({ Name: "TestBranch" });

    database
      .fetchDB()
      .collection("Users")
      .deleteMany({ _id: { $in: [user1_id, user2_id] } });
    database
      .fetchDB()
      .collection("Alerts")
      .deleteMany({ user_associated: { $in: [user1_id, user2_id] } });
    database
      .fetchDB()
      .collection("Alerts")
      .deleteMany({ sender: { $in: [user1_id, user2_id] } });
    database
      .fetchDB()
      .collection("Workshops")
      .deleteMany({
        ExpertIds: { $in: [{ $all: [user1_id] }, { $all: [user2_id] }] },
      });
    database
      .fetchDB()
      .collection("GroupSessions")
      .deleteMany({ Expert: user1_id });
    done();
  });
});
