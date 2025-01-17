const { ObjectId } = require("mongodb");

app.get("/api/testWS", async (req, res) => {
    var wsObj = {
      _id: "someId",
      Duration: 0.25 / 60,
      StartDateTime: new Date(Date.now() + 1000 * 0.25 * 60),
    };
  
    var wsObj1 = {
      _id: "some other Id",
      Duration: 0.25 / 60,
      StartDateTime: new Date(Date.now() + 1000 * 0.75 * 60),
    };
  
    // await wsUtils.createCronJob(wsObj);
    // await wsUtils.createCronJob(wsObj1);
  
    res.end();
  });

  app.get("/api/testWS/createWS", async (req, res) => {
    const Workshop = {
      _id: ObjectId("62090ef9c2c000f949b2a9dd"),
      Tag: "Public Speaking",
      Name: "Aragog's Quest",
      Capacity: 60,
      ExpertIds: [ObjectId("620969d57c0c1e6e8eee9dec")],
      MenteeIds: [],
      Details: {
        StartDateTime: new Date(Date.now() + 1000 * 0.5 * 60),
        Duration: 0.5 / 60,
        Location: "Hacienda North",
        isOnline: true,
      },
      N_Booked: 0,
    };
  
    await wsUtils.createWorkshop(Workshop);
  
    res.end();
  });
  
  app.get("/api/testWS/deleteWS", async (req, res) => {
    var workshopID = ObjectId("62090ef9c2c000f949b2a9dd");
  
    await wsUtils.deleteWorkshop("someIDhere", workshopID);
  
    res.end();
  });
  
  app.get("/api/testWS/endWS", async (req, res) => {
    var workshopID = ObjectId("62090ef9c2c000f949b2a9dd");
  
    await wsUtils.deleteWorkshop("someIDhere", workshopID);
  
    res.end();
  });
  
  app.get("/api/testWS/editWS", async (req, res) => {
    var workshopID = ObjectId("62090ef9c2c000f949b2a9dd");
  
    const updatedWorkshop = {
      Name: "Confronting audiences",
      Capacity: 100,
      ExpertIds: ["someIDhere", "anotherIDhere"],
      Details: {
        StartDateTime: new Date(Date.now() + 1000 * 5 * 60),
        Duration: 1,
        Location: "Makola North",
        isOnline: false,
      },
    };
  
    await wsUtils.editWorkshop(workshopID, updatedWorkshop);
  
    res.end();
  });
  
  app.get("/api/testWS/bookWS", async (req, res) => {
    var workshopID = ObjectId("620d475903809dffbcb40953");
    var mentee1 = ObjectId("61fbe93182cced00e4ba20ad");
    var mentee2 = ObjectId("61fbe93482cced00e4ba20ae");
  
    await wsUtils.bookWorkshop(mentee1, workshopID);
    await wsUtils.bookWorkshop(mentee2, workshopID);
  
    res.end();
  });
  
  app.get("/api/testWS/unbookWS", async (req, res) => {
    var workshopID = ObjectId("62090ef9c2c000f949b2a9dd");
    var mentee1 = ObjectId("61fbe93182cced00e4ba20ad");
  
    await wsUtils.unBookWorkshop(mentee1, workshopID);
  
    res.end();
  });
  
  app.get("/api/testWS/addToWatchlist", async (req, res) => {
    var mentee1 = ObjectId("61fbe93182cced00e4ba20ad");
    var mentee2 = ObjectId("61fbe93482cced00e4ba20ae");
  
    await wsUtils.addTagToWatchlist(mentee1, "Public Speaking");
    await wsUtils.addTagToWatchlist(mentee1, "Networking");
    await wsUtils.addTagToWatchlist(mentee1, "Leadership");
  
    await wsUtils.addTagToWatchlist(mentee2, "Public Speaking");
    await wsUtils.addTagToWatchlist(mentee2, "Career");
  
    res.end();
  });
  
  app.get("/api/testWS/removeFromWatchlist", async (req, res) => {
    var mentee1 = ObjectId("61fbe93182cced00e4ba20ad");
  
    await wsUtils.removeTagFromWatchlist(mentee1, "Public Speaking");
    await wsUtils.removeTagFromWatchlist(mentee1, "Networking");
  
    res.end();
  });
  
  app.get("/api/testMRS/mapFunc", async (req, res) => {
    var mentee1 = ObjectId("61fbe93182cced00e4ba20ad");
  
    await mappingUtils.getMentorExpertiseStrings(mentee1);
    await mappingUtils.convertTagNamesToBinary([
      "Career",
      "Time Management",
      "Communication",
      "Formal Writing",
      "Research",
      "Writing",
    ]);
  
    res.end();
  });


  app.get("/api/testWS/assignBranches", async (req, res) => {
    const BranchesCollection = await database.fetchDB().collection("Branches");
    var branches = await BranchesCollection.find({}).toArray();
    var n_branches = branches.length;
  
  
    const Users = await database.fetchDB().collection("Users");
    var users = await Users.find({}).toArray();
  
    users.forEach(async(elem) => {
      var rand_num = Math.floor(Math.random() * (n_branches));
      if(rand_num==n_branches){
        rand_num = n_branches-1;
      }
      var rand_branch = branches[rand_num].Name;
      await Users.updateOne({_id : elem._id}, {$set : {branch : rand_branch}});
    });
  
    res.end();
  });


  app.get("/api/testWS/assignWSBranches", async (req, res) => {

    const Users = await database.fetchDB().collection("Users");
  
    const WorkshopsCollection = await database.fetchDB().collection("Workshops");
    var workshops = await WorkshopsCollection.find({}).toArray();
  
    workshops.forEach(async(elem) => {
      var expert = await Users.findOne({_id : elem.ExpertIds[0]});
      var branch = expert.branch;
      await WorkshopsCollection.updateOne({_id : elem._id}, {$set : {"Details.branch" : branch}});
    });
  
    res.end();
  });



  var branch1 = {
    Name: "Marley",
    Locations: ["IIC Hall", "Theatre 1", "Golden Room"],
    Tags: [
      {
        Name: 'Public Speaking',
        Demand: { cumulative: 584, current: 285, watchlist: 137, N_predicted: 360 },
        Experts: [
          '61f6cffde1a69c803119fedb',
          '61f6cffde1a69c803119fedc',
          '61f6cffde1a69c803119fedd',
          '61f6cffde1a69c803119fede'
        ],
        wsRecommended: false,
        index: 5
      },
      {
        Name: 'Networking',
        Demand: { cumulative: 493, current: 146, watchlist: 116, N_predicted: 0 },
        Experts: [
          '61f6cffde1a69c803119fedf',
          '61f6cffde1a69c803119fee0',
          '61f6e045bd3ba846b929cdcc'
        ],
        wsRecommended: false,
        index: 10
      },
      {
        Name: 'Leadership',
        Demand: { cumulative: 500, current: 140, watchlist: 50, N_predicted: 0 },
        wsRecommended: false,
        Experts: [],
        index: 6
      },
      {
        Name: 'Career',
        Demand: { cumulative: 0, current: 0, watchlist: 7, N_predicted: 0 },
        Experts: [],
        wsRecommended: false,
        index: 0
      }
    ]
  };

  var branch2 = {
    Name: "Coventry",
    Locations: ["The Blue Room", "Halifax Hall", "RX2.01"],
    Tags: [
      {
        Name: 'Public Speaking',
        Demand: { cumulative: 200, current: 12, watchlist: 5, N_predicted: 0 },
        Experts: [
          '61f6cffde1a69c803119fedb',
          '61f6cffde1a69c803119fedc',
          '61f6cffde1a69c803119fedd',
          '61f6cffde1a69c803119fede'
        ],
        wsRecommended: false,
        index: 5
      },
      {
        Name: 'Networking',
        Demand: { cumulative: 493, current: 146, watchlist: 116, N_predicted: 0 },
        Experts: [
          '61f6cffde1a69c803119fedf',
          '61f6cffde1a69c803119fee0',
          '61f6e045bd3ba846b929cdcc'
        ],
        wsRecommended: false,
        index: 10
      },
      {
        Name: 'Leadership',
        Demand: { cumulative: 23, current: 1, watchlist: 50, N_predicted: 0 },
        wsRecommended: false,
        Experts: [],
        index: 6
      },
      {
        Name: 'Career',
        Demand: { cumulative: 670, current: 450, watchlist: 38, N_predicted: 0 },
        Experts: [],
        wsRecommended: false,
        index: 0
      }
    ]
  };


  app.get("/api/testWS/createBranches", async (req, res) => {
    const BranchesCollection = await database.fetchDB().collection("Branches");
    var branches = await BranchesCollection.find({}).toArray();
    var n_branches = branches.length;


    const Users = await database.fetchDB().collection("Users");
    var users = await Users.find({}).toArray();

    users.forEach(elem => {
      var rand_num = Math.floor(Math.random() * n_branches);
      var rand_branch = branches[rand_num].Name;
      await Users.updateOne({_id : elem._id}, {$set : {branch : rand_branch}});
    });

    res.end();
  });



  app.get("/api/testWS/branchDprocTest", async (req, res) => {
    await workshop_handler.processDemand();
    res.end();
  });
  
  app.get("/api/testWS/createWS", async (req, res) => {
    const Workshop = {
      _id: ObjectId("62090ef9c2c000f949b2a9dd"),
      Tag: "Public Speaking",
      Name: "Aragog Quest",
      Capacity: 60,
      ExpertIds: [ObjectId("620969d57c0c1e6e8eee9dec")],
      MenteeIds: [],
      Details: {
        StartDateTime: new Date(Date.now() + 1000 * 3 * 60),
        Duration: 0.5,
        Location: "Hacienda North",
        isOnline: true,
      },
      N_Booked: 0,
    };
  
    await wsUtils.createWorkshop(Workshop);
  
    res.end();
  });


  app.get("/api/testWS/setMentorStatus", async (req, res) => {
    const UserCollection = await database.fetchDB().collection("Users");
    var user = await UserCollection.findOne({_id : ObjectId("61fbe93882cced00e4ba20c2")});
    console.log(user.aoe);
    res.end();
  });


  app.get("/api/testWS/setMentorStatus", async (req, res) => {
    const UserCollection = await database.fetchDB().collection("Users");
    var tagCount = await mappingUtils.getTotalTagCount();
  
    var len = await mappingUtils.getTotalTagCount();
    var zeros =  new Array(len);
    zeros.fill(0); 
    // var mentors = await UserCollection.find({aoe : {$all: [1]}}).toArray();
    // var notMentors = await UserCollection.find({aoe : {$nin: [1]}}, {aoe : {$size:0}}).toArray();
  
    await UserCollection.updateMany({aoe : {$all: [1]}},{$set : {isMentor : true}});
    await UserCollection.updateMany({aoe : {$nin: [1]},aoe : {$size:0}},{$set : {isMentor : false}, $set: {aoe:zeros}});
  
    res.end();
  });


  app.get("/api/branchUpdate" , async (req, res) => {
    const TagsCollection = database.fetchDB().collection("Tags");
    const BranchesCollection = await database.fetchDB().collection("Branches");
  
    var Tags = await TagsCollection.find({}).toArray();
  
    Tags.forEach((element) => {
      element.Demand.wsRecommendedTo = [];
    });
  
    await BranchesCollection.updateOne({Name : "Marley"},
      {$push: {Tags : {$each: Tags} }});
  
    res.end();
    
  })