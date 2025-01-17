const express = require("express");
const { json, application } = require("express");
const { ObjectId } = require("mongodb");
const cors = require("cors");
const session = require("express-session");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken")

const database = require("./config/database_handler");
const server_cron = require("./services/cron_jobs/main-cron");
const cronManager = require("./services/cron_jobs/generic_cron_manager");

const authenticate = require("./services/Auth/authenticate");
const workshop_handler = require("./services/AWSS/demand_proc");
const wsUtils = require("./services/AWSS/WorkshopUtils");
const groupUtils = require("./services/AWSS/GroupUtils");
const mappingUtils = require("./services/mrs/mappingUtils");
const gns = require("./services/GNS/general-notification-system");
const scheduler = require("./services/Scheduler/scheduler");
const key = require('./config/api-key.json')
var cookieParser = require('cookie-parser')

const {
  mentor_recommender,
  scattershot,
} = require("./services/mrs/mentor-recommendation-system");

const app = express();
app.use(express.static(path.resolve(__dirname, "./client/build")));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: "secret" }));
app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(cookieParser())

const PORT = 3001;

/* Websocket stuff */
gns.startSocket();

// If API key isn't present, reject the request and return 401
/* app.use('/api', (req, res, next) => {
  if (req.headers["api-key"] == key['key']) {
    next()
  } else {
    res.status(401).send("Incorrect API Key");
  }
}) */

const authenticateAPIKey = (req, res, next) => {
  if (req.headers["api-key"] == key['key']) {
    next()
  } else {
    res.status(401).send("Incorrect API Key")
  }
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.cookies['jwtToken']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) {
    return res.status(401).end()
  }
  jwt.verify(token, key['key'], (err, user) => {

    if (err) {
      console.log(err)
      return res.status(403).end()
    }

    next()
  })
}

app.get('/api/', authenticateAPIKey, (req, res) => {
  res.status(200).json({"message": "API key found and correct"})
})

// Login and registration endpoints
app.post("/api/auth/login", async (req, res) => {
  await authenticate.login(req, res);
});

app.post("/api/auth/register", async (req, res) => {
  await authenticate.register(req, res);
});

app.get('/api/workshops/:id', authenticateToken, async (req, res) => {
  try {
    var { id } = req.params;

    var workshop = await database
      .fetchDB()
      .collection("Workshops")
      .find({ _id: ObjectId(id) })
      .toArray();
    workshop = workshop[0];

    res.status(200);
    res.json(workshop);
  } catch (err) {
    res.status(400).end();
  }
});

// Account settings
// Update mentor's free times
app.put("/api/times/", authenticateToken, async (req, res) => {
  try {
    var mentor_id = req.body.mentor_id;
    var day = req.body.day;
    var times = req.body.times;

    var isodate = new Date(day + "T09:00:00.000Z");

    var exists = await database
      .fetchDB()
      .collection("Times")
      .find({ date: isodate })
      .toArray();
    if (exists.length == 0) {
      database.fetchDB().collection("Times").insertOne({ date: isodate });
    }

    var user_times = {};

    objs = [];
    times.forEach((time) => {
      var start_time_split = time.split(":");
      var hrs = parseInt(start_time_split[0]);
      var mins = parseInt(start_time_split[1]);

      var start = new Date(day);
      start.setHours(hrs);
      start.setMinutes(mins);

      var end = new Date(day);
      end.setHours(hrs + 1);
      end.setMinutes(mins);

      objs.push([start, end]);
    });

    user_times[mentor_id] = objs;

    database
      .fetchDB()
      .collection("Times")
      .updateOne({ date: isodate }, { $set: user_times });
    res.status(200).end();
  } catch {
    res.status(400).end();
  }
});

app.post("/api/workshops/updateWatchlist", authenticateToken, async (req, res) => {
  try {
    var menteeId = new ObjectId(req.body.menteeID);
    var branchName = req.body.branchName;
    var watchlist = await mappingUtils.getNamesFromTags(req.body.watchlist);
    await wsUtils.updateWatchlist(menteeId, watchlist, branchName);
    res.status(200).end();
  } catch (err) {
    res.status(400).end();
  }
});

app.post("/api/workshops/approveWatchlist", authenticateToken, async(req, res) => {
  try {
    var menteeId = new ObjectId(req.body.mentee_id);
    var mentorId = new ObjectId(req.body.mentor_id);
    var workshopId = new ObjectId(req.body.details.item._id);
    var type = req.body.type;

    if (["Accept", "Reject"].indexOf(type) == -1) {
      res.status(400).end();
    }
    if (type === "Accept") {
      await wsUtils.bookWorkshop(menteeId, workshopId);
      await wsUtils.removeTagFromWatchlist(
        menteeId,
        req.body.details.item.Tag,
        req.body.branch
      );
    }

    await database
      .fetchDB()
      .collection("Alerts")
      .deleteOne({
        sender: mentorId,
        user_associated: menteeId,
        type: 9,
        "details.item._id": workshopId,
      });
    res.status(200).end();
  } catch {
    res.status(400).end();
  }
});

app.post("/api/workshops/getWatchlist", authenticateToken, async(req, res) => {
  try {
    var menteeId = new ObjectId(req.body.mentee_id);
    const UsersCollection = await database.fetchDB().collection("Users");
    var mentee = await UsersCollection.findOne({ _id: menteeId });

    res.json({ watchlist: mentee.watchlist });
    res.status(200).end();
  } catch {
    res.status(400).end();
  }
});

app.post("/api/workshops/workshopSel", authenticateToken, async (req, res) => {
  try {
    var workshops = await wsUtils.getCurrentWorkshops(
      req.body.userBranch,
      ObjectId(req.body.userID)
    );
    res.json(workshops);
  } catch {
    res.status(400).end();
  }
});

app.post("/api/workshops/createWorkshop", authenticateToken, async(req, res) => {
  try {
    await wsUtils.createWorkshop(
      req.body.mentorIDs,
      req.body
    );
    res.status(200).end();
  } catch (err) {
    console.log(err);
    res.status(400).end();
  }
});

app.post("/api/workshops/bookedWorkshops", authenticateToken, async(req, res) => {
  try {
    var menteeId = new ObjectId(req.body.menteeID);
    //console.log(menteeId);
    var bookedWorkshops = await wsUtils.getBookedWorkshops(menteeId);
    //console.log("Booked:", bookedWorkshops);
    res.json(bookedWorkshops);
  } catch {
    res.status(400).end();
  }
});

app.post("/api/workshops/bookAWorkshop", authenticateToken, async(req, res) => {
  try {
    var menteeId = new ObjectId(req.body.menteeID);
    var workshopId = new ObjectId(req.body.workshopID);
    await wsUtils.bookWorkshop(menteeId, workshopId);
    res.status(200).end();
  } catch {
    res.status(400).end();
  }
});

app.post("/api/workshops/unbookAWorkshop", authenticateToken, async(req, res) => {
  try {
    var menteeId = new ObjectId(req.body.menteeID);
    var workshopId = new ObjectId(req.body.workshopID);
    await wsUtils.unBookWorkshop(menteeId, workshopId);
    res.status(200).end();
  } catch {
    res.status(400).end();
  }
});

app.post("/api/workshops/approveRecommended", authenticateToken, async(req, res) => {
  try {
    await wsUtils.removeRecommendedExpert(
      ObjectId(req.body.mentor_id),
      req.body.details.branchName,
      req.body.details.tag.Name
    );

    await database
      .fetchDB()
      .collection("Alerts")
      .deleteOne({
        sender: null,
        user_associated: ObjectId(req.body.mentor_id),
        type: 10,
        "details.tag._id": ObjectId(req.body.details.tag._id),
      });
    res.status(200).end();
  } catch {
    res.status(400).end();
  }
});

app.post("/api/group/createGroupSession", authenticateToken, async(req, res) => {
  try {
    await groupUtils.createGroupSession(ObjectId(req.body.mentor_id), req.body.menteeIds, req.body.tag.Name, req.body.Name, req.body.Details);
    
    res.status(200).end()
  } catch {
    res.status(400).end();
  }
});


app.post("/api/group/approveSession", authenticateToken, async(req, res) => {
  try {
    var mentee_id = ObjectId(req.body.mentee_id);
    var session_id = ObjectId(req.body.details.item._id);

    await database
      .fetchDB()
      .collection("Alerts")
      .deleteOne({
        sender: ObjectId(req.body.mentor_id),
        user_associated: mentee_id,
        type: 16,
        "details.item._id": session_id,
      });
    await groupUtils.addToAccepted(session_id, mentee_id);
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
});

app.post("/api/scheduler/getSchedule", authenticateToken, async(req, res) => {
  try {
    var userID = new ObjectId(req.body.userID);
    var schedule = await scheduler.getSchedule(userID);
    res.json(schedule);
  } catch {
    res.status(400).end();
  }
});

app.post("/api/alerts/", authenticateToken, async (req, res) => {
  // Collect the alert from the body of the request 

  try {
    var user = req.body.alert.user_associated;
    // Construct the alert object from the fields in the request
    var alert = {
      sender: ObjectId(req.body.alert.sender),
      user_associated: ObjectId(user),
      message: req.body.alert.message,
      type: req.body.alert.type,
      created: new Date(),
      details: req.body.alert.details,
    };

    // Send alert to the database
    gns
      .addAlerts([alert])
      .then(() => {
        gns.sendAlertViaSocket(user, alert);
        res.status(200);
        res.json({});
      })
      .catch(() => res.status(400).end());
  } catch {
    res.status(400).end("Incorrect fields.");
  }
});

app.get("/api/alerts/:id", authenticateToken, async (req, res) => {
  try {
    var { id } = req.params;

    // Gets the alerts for the associated user
    gns
      .getAlerts(id)
      .then((data) => {
        res.status(200);
        res.json(data);
      })
      .catch(() => {
        res.status(500).end();
      });
  } catch {
    res.status(400).end();
  }
});

// Mentee can accept or reject a mentor
app.post("/api/mrs/mentee", authenticateToken, async (req, res) => {
  try {
    var mentee_id = req.body.mentee_id;
    var type = req.body.type;
    var mentor_id = req.body.mentor_id;

    if (["Accept", "Reject"].indexOf(type) == -1) {
      res.status(400).end();
    }

    var mentoring_partnerships = database
      .fetchDB()
      .collection("MentoringPartnerships");
    mentoring_partnerships.updateOne(
      { mentee: ObjectId(mentee_id), mentor: ObjectId(mentor_id) },
      { $set: { mentee_status: type } }
    );

    if (type == "Accept") {
      var mentoring_status = database.fetchDB().collection("MentoringStatus");
      mentoring_status.updateOne(
        { mentee: ObjectId(mentee_id) },
        { $set: { status: "Set", mentor: ObjectId(mentor_id) } }
      );

      // Delete everything from mentoring_partnerships relating to the mentee when the scattershot is ended
      mentoring_partnerships.deleteMany({ mentee: ObjectId(mentee_id) });
    }

    database
      .fetchDB()
      .collection("Alerts")
      .deleteOne({ user_associated: ObjectId(mentee_id), type: 2 });
    database
      .fetchDB()
      .collection("Alerts")
      .deleteMany({ sender: ObjectId(mentee_id), type: 1 });

    var alert = {
      sender: ObjectId(mentee_id),
      user_associated: ObjectId(mentor_id),
      message: null,
      type: 15,
    };

    gns.sendAlertViaSocket(mentor_id, alert);

    res.status(200).end();
  } catch {
    res.status(400).end();
  }
});

app.get("/api/times/:id",  authenticateToken, async (req, res) => {
  var {id} = req.params

  try {
    if (req.query.day) {
      var day = req.query.day;

      var isodate = new Date(day + "T09:00:00.000Z");
      var query = {
        date: isodate,
      };
      query[id] = { $exists: true };
      var project = {
        date: 1,
      };
      project[id] = 1;

      var time_free = await database
        .fetchDB()
        .collection("Times")
        .find(query)
        .project(project)
        .toArray();

      if (time_free.length === 0) {
        res.json([]);
      } else {
        res.json(time_free[0]);
      }
    } else {
      var query = {};
      query[id] = { $exists: true };

      var project = {
        date: 1,
      };

      var days_free = await database
        .fetchDB()
        .collection("Times")
        .find(query)
        .project(project)
        .toArray();

      res.json(days_free);
    }
  } catch {
    res.status(400).end();
  }
});

// Endpoint to end a mentee-mentor relationship
app.post("/api/mrs/end",  authenticateToken, async(req, res) => {
  try {
    var mentor_id = req.body.mentor_id;
    var mentee_id = req.body.mentee_id;
    var reason = req.body.reason;

    partnership = await database
      .fetchDB()
      .collection("MentoringStatus")
      .find({
        mentee: ObjectId(mentee_id),
        mentor: ObjectId(mentor_id),
        status: "Set",
      })
      .toArray();
    await database
      .fetchDB()
      .collection("MentoringStatus")
      .updateOne(
        {
          mentee: ObjectId(mentee_id),
          mentor: ObjectId(mentor_id),
          status: "Set",
        },
        { $set: { status: "Ended", date_ended: new Date(), reason: reason } }
      );

    // Delete all upcoming meetings between the mentee and the mentor
    await database
      .fetchDB()
      .collection("Meetings")
      .deleteMany({
        mentor_id: ObjectId(mentor_id),
        mentee_id: ObjectId(mentee_id),
      });

    // Send a type 5 alert to both the mentee and mentor signifying that the partnership has ended.
    var alert = {
      sender: ObjectId(mentee_id),
      user_associated: ObjectId(mentor_id),
      message: null,
      type: 5,
      created: new Date(),
      details: null,
    };

    var alert2 = {
      ...alert,
      sender: ObjectId(mentor_id),
      user_associated: ObjectId(mentee_id),
    };

    var feedbackAlert = {
      sender: ObjectId(mentee_id),
      user_associated: ObjectId(mentor_id),
      message: null,
      type: 7,
      created: new Date(),
      details: {
        partnershipId: partnership[0]._id,
      },
    };

    var feedbackAlert = {
      ...alert,
      type: 7,
      details: { partnershipId: partnership[0]._id },
    };
    var feedbackAlert2 = {
      ...alert2,
      type: 7,
      details: { partnershipId: partnership[0]._id },
    };

    gns
      .addAlerts([feedbackAlert, feedbackAlert2])
      .then(() => {
        gns.sendAlertViaSocket(mentor_id, alert);
        gns.sendAlertViaSocket(mentee_id, alert2);
        gns.sendAlertViaSocket(mentor_id, feedbackAlert);
        gns.sendAlertViaSocket(mentee_id, feedbackAlert2);
      })
      .catch(() => res.status(400).end());

    res.status(200).end();
  } catch {
    res.status(400).end();
  }
});

app.post("/api/feedback",  authenticateToken, async (req, res) => {
  try {
    var id = {};
    if (req.body.partnershipId) {
      id["partnershipId"] = ObjectId(req.body.partnershipId);
    } else if (req.body.workshopId) {
      id["workshopId"] = ObjectId(req.body.workshopId);
    }

    var obj = {
      star_rating: req.body.star_rating,
      given_by: ObjectId(req.body.given_by),
      given_to: ObjectId(req.body.given_to),
      feedback_body: req.body.feedback_body,
      date_created: new Date(),
      details: id,
    };
    await database.fetchDB().collection("Feedback").insertOne(obj);
    await database
      .fetchDB()
      .collection("Alerts")
      .deleteOne({ user_associated: ObjectId(req.body.given_by), type: 7 });
    res.status(200).end();
  } catch {
    res.status(400).end();
  }
});

const mstoneCron_manager = new cronManager.cronManager(
  "MilestoneCronJobs",
  mstoneCronExecutor
);

async function mstoneCronExecutor(job) {
  switch (job.executionType) {
    case 1:
      console.log("Milestone Cron: Exec Type 1 - Feedback Notification");
      await milestoneNotify(job.itemID, job.params.mentee_id);
      await this.deleteCronJob(job);
      break;
    default:
      console.log("excution type unknown");
      break;
  }
}

async function milestoneNotify(mentorID, menteeID) {
  var alert = {
    sender: menteeID,
    user_associated: mentorID,
    message: null,
    type: 6,
    created: new Date(),
    details: null,
  };

  gns.addAlerts([alert]).then(() => {
    gns.sendAlertViaSocket(mentorID, alert);
  });
}


app.post("/api/times/schedule",  authenticateToken, async(req, res) => {
  try {
    var mentor_id = req.body.mentor_id;
    var mentee_id = req.body.mentee_id;
    var date = req.body.date;
    var start_time = req.body.start_time;
    var meeting_title = req.body.meeting_title;

    var start_time_split = start_time.split(":");
    var hrs = start_time_split[0];
    var mins = start_time_split[1];

    var date_time_of_meeting = new Date(date);
    date_time_of_meeting.setHours(hrs);
    date_time_of_meeting.setMinutes(mins);

    var query = { date: new Date(date + "T09:00:00Z") };

    //query[mentor_id] = {"$elemMatch" : {"$elemMatch" : {"$in" : [date_time_of_meeting]}}}
    query[mentor_id] = { $exists: true };

    var project = {};
    project[mentor_id] = 1;

    // Find our mentor's free times on that particular day and create a new free times by removing the slot that starts at the hour of the meeting
    var found = await database
      .fetchDB()
      .collection("Times")
      .find(query)
      .project(project)
      .toArray();

    var updated_times = [];
    found[0][mentor_id].forEach((arr) => {
      if (arr[0].getTime() !== date_time_of_meeting.getTime()) {
        updated_times.push(arr);
      }
    });

    // Create a new free times object for the mentor and update the database
    var updated_times_obj = {};
    updated_times_obj[mentor_id] = updated_times;
    await database
      .fetchDB()
      .collection("Times")
      .updateOne(query, { $set: updated_times_obj });

    // Add the meeting to our Meeting database
    var meeting_obj = {
      mentor_id: ObjectId(mentor_id),
      mentee_id: ObjectId(mentee_id),
      meeting_title: "Meeting with Mentoring Partner",
      status: "Requested",
      StartDateTime: date_time_of_meeting,
      timeString: start_time,
      location: req.body.location,
    };

    var alert = {
      sender: ObjectId(mentee_id),
      user_associated: ObjectId(mentor_id),
      message: null,
      type: 3,
      created: new Date(),
      details: {
        meeting_date: new Date(date_time_of_meeting).toLocaleDateString(),
        meeting_time: new Date(date_time_of_meeting).toLocaleTimeString(),
        date_time: date_time_of_meeting,
        location: req.body.location,
      },
    };

    gns
      .addAlerts([alert])
      .then(() => {
        gns.sendAlertViaSocket(mentor_id, alert);
      })
      .catch(() => res.status(400).end());

    await database.fetchDB().collection("Meetings").insertOne(meeting_obj);

    res.status(200).end();
  } catch (err) {
    console.log(err);
    res.status(400).end();
  }
});

app.post("/api/times/approve",  authenticateToken, async(req, res) => {

  try {
    var mentor_id = req.body.mentor_id;
    var mentee_id = req.body.mentee_id;
    var type = req.body.type;
    var date = req.body.date;
    var time = req.body.time;

    var time_split = time.split(":");
    var hrs = time_split[0];
    var mins = time_split[1];

    var date_time = new Date(date);
    date_time.setHours(hrs);
    date_time.setMinutes(mins);

    var duration = 1; //hrs
    var endTime = date_time.getTime();
    endTime = endTime + duration * 3600;
    endTime = new Date(endTime);

    //console.log(date_time);
    //console.log(endTime);

    if (["Accept", "Reject"].indexOf(type) == -1) {
      res.status(400).end();
    }
    if (type === "Accept") {
      await database
        .fetchDB()
        .collection("Meetings")
        .updateOne(
          { mentor_id: ObjectId(mentor_id), mentee_id: ObjectId(mentee_id) },
          { $set: { status: "Upcoming" } }
        );
      // formatting to cron item format
      var tempCronMeetingItem = {
        _id: ObjectId(mentor_id),
        Details: {
          StartDateTime: date_time,
          EndDateTime: endTime,
        },
        params: {
          mentee_id: ObjectId(mentee_id),
        },
      };

      await mstoneCron_manager.createCronJob(tempCronMeetingItem, 1);
    } else {
      await database
        .fetchDB()
        .collection("Meetings")
        .deleteOne({
          mentor_id: ObjectId(mentor_id),
          mentee_id: ObjectId(mentee_id),
        });
    }

    database
      .fetchDB()
      .collection("Alerts")
      .deleteOne({
        sender: ObjectId(mentee_id),
        user_associated: ObjectId(mentor_id),
        type: 3,
      });

    res.status(200).end();
  } catch (err) {
    console.log(err);
    res.status(400).end();
  }
});

app.post("/api/mrs/mentor",  authenticateToken, async (req, res) => {
  try {
    var mentee_id = req.body.mentee_id;
    var type = req.body.type;
    var mentor_id = req.body.mentor_id;

    if (["Accept", "Reject"].indexOf(type) == -1) {
      res.status(400).end();
    }

    var mentoring_partnerships = database
      .fetchDB()
      .collection("MentoringPartnerships");
    mentoring_partnerships.updateOne(
      { mentee: ObjectId(mentee_id), mentor: ObjectId(mentor_id) },
      { $set: { mentor_status: type } }
    );
    //console.log(type)

    var type2AlertsForMentee = await database
      .fetchDB()
      .collection("Alerts")
      .find({ user_associated: ObjectId(mentee_id), type: 2 })
      .toArray();

    //console.log(type2AlertsForMentee.length)
    //The mentee only needs one type 2 alert due to its nature. This prevents multiple type 2 alerts which would clog up alerts.
    if (type2AlertsForMentee.length === 0) {
      if (type == "Accept") {
        var alert = {
          sender: ObjectId(mentor_id),
          user_associated: ObjectId(mentee_id),
          type: 2,
          created: new Date(),
          details: null,
        };

        gns
          .addAlerts([alert])
          .then(() => {
            gns.sendAlertViaSocket(mentee_id, alert);
          })
          .catch(() => res.status(400).end());
      }
    }

    //console.log(ObjectId(mentor_id))
    //console.log(ObjectId(mentee_id))
    database
      .fetchDB()
      .collection("Alerts")
      .deleteOne({
        sender: ObjectId(mentee_id),
        user_associated: ObjectId(mentor_id),
        type: 1,
      });
    res.status(200).end();
  } catch {
    res.status(400).end();
  }
});

app.post("/api/user/dashboard",  authenticateToken, async (req, res) => {
  try {
    var user_id = req.body.user_id;
    var mentor_id = req.body.mentor_id;
    var mentee_array = req.body.mentee_array;

    const userCollection = await database.fetchDB().collection("Users");
    const meetingCollection = await database.fetchDB().collection("Meetings");

    if (mentor_id) {
      const user = await userCollection
        .find({ _id: ObjectId(mentor_id) })
        .toArray();
      const meetings = await meetingCollection
        .find({ mentor_id: ObjectId(mentor_id), mentee_id: ObjectId(user_id) })
        .toArray();
      user[0].aoe = await mappingUtils.getRelevantTagObjectsFromBinaryArray(
        user[0].aoe
      );
      user[0].interests =
        await mappingUtils.getRelevantTagObjectsFromBinaryArray(
          user[0].interests
        );

      var obj = {
        user: user,
        meetings: meetings,
      };

      res.status(200);
      res.json(obj);
    } else if (mentee_array) {
      var users = [];
      mentee_array = JSON.parse(mentee_array);
      const me = await userCollection
        .find({ _id: ObjectId(user_id) })
        .toArray();
      var mentorAoes = await mappingUtils.getRelevantTagObjectsFromBinaryArray(
        me[0].aoe
      );
      for (var i = 0; i < mentee_array.length; i++) {
        const user = await userCollection
          .find({ _id: ObjectId(mentee_array[i].mentee) })
          .toArray();
        const meetings = await meetingCollection
          .find({
            mentor_id: ObjectId(user_id),
            mentee_id: ObjectId(mentee_array[i].mentee),
          })
          .toArray();
        user[0].aoe = await mappingUtils.getRelevantTagObjectsFromBinaryArray(
          user[0].aoe
        );
        user[0].interests =
          await mappingUtils.getRelevantTagObjectsFromBinaryArray(
            user[0].interests
          );

        var obj = {
          user: user,
          meetings: meetings,
          mentor_aoe: mentorAoes,
        };

        users.push(obj);
      }
      res.status(200);
      res.json(users);
    }

    res.status(200).end();
  } catch (err) {
    console.log(err);
    res.status(400).end();
  }
});

app.get("/api/user/:id", authenticateToken, async (req, res) => {
  try {
    var { id } = req.params;

    const userCollection = await database.fetchDB().collection("Users");
    const user = await userCollection.find({ _id: ObjectId(id) }).toArray();

    user[0].aoe = await mappingUtils.getRelevantTagObjectsFromBinaryArray(
      user[0].aoe
    );
    user[0].interests = await mappingUtils.getRelevantTagObjectsFromBinaryArray(
      user[0].interests
    );

    res.status(200);
    res.json(user[0]);
  } catch {
    res.status(400).end();
  }
});

app.put("/api/user/:id",  authenticateToken, async (req, res) => {
  try {
    var { id } = req.params;
    var obj = req.body;

    const updateSuccess = await database.fetchDB().collection("Users").updateOne({"_id" : ObjectId(id)}, {"$set" : obj});
    res.json(updateSuccess);
    res.status(200).end();
  } catch {
    res.status(400).end();
  }
});

app.delete("/api/user/:id",  authenticateToken, async (req, res) => {
  try {
    var {id} = req.params;
    var deleteSuccess = await database.fetchDB().collection("Users").deleteOne({ "_id" : ObjectId(id) });
    //console.log(deleteSuccess);
    res.status(200).end()
  } catch {
    res.status(400).end();
  }
});

app.post("/api/mrs/recommend",  authenticateToken, async (req, res) => {
  try {
    var user_id = req.body["id"];
    var tags = req.body["tags"];
    var business = req.body["business"];

    // Create a temporary user (I haven't figured out how to pass entire users through POST)
    var user = { interests: tags, business: business };

    // Wait for the mentor recommender algorithm and return the first 10 users
    var mentors = await mentor_recommender(user);
    mentors = mentors.slice(0, 10);

    // Add to mentoring partnerships
    await scattershot(user_id, mentors);

    // Scattershot to the 10 mentors
    for (const mentor of mentors) {
      var alert = {
        sender: ObjectId(user_id),
        user_associated: mentor._id,
        message: null,
        type: 1,
        created: new Date(),
        details: null,
      };

      await wsUtils.updateTagsCurrentCount(ObjectId(user_id), tags);
      await database
        .fetchDB()
        .collection("Users")
        .updateOne({ _id: ObjectId(user_id) }, { $set: { interests: tags } });

      gns
        .addAlerts([alert])
        .then(() => {
          gns.sendAlertViaSocket(mentor._id, alert);
        })
        .catch(() => res.status(400).end());
    }

    res.status(200);
    res.json(mentors);
  } catch (err) {
    res.status(400).end();
  }
});

// Status of mentors for a particular user with :id
app.get("/api/mrs/status/:id",  authenticateToken, async(req, res) => {
  try {
    var { id } = req.params;
    var mentoring_status = database.fetchDB().collection("MentoringStatus");

    // console.log(id)

    var user_partnerships = await mentoring_status
      .find({ mentee: ObjectId(id), status: { $ne: "Ended" } })
      .toArray();
    if (user_partnerships.length == 0) {
      res.send({ message: "User does not have a mentoring partnership" });
    } else {
      // If the user requests partnership information
      if (req.query.partnerships == "true") {
        // Find the partnerships
        var mentoring_partnerships = await database
          .fetchDB()
          .collection("MentoringPartnerships");
        var partnerships = await mentoring_partnerships
          .find({ mentee: ObjectId(id) })
          .toArray();
        var obj = {};

        // If detailed information is requested
        if (req.query.detailed == "true") {
          // Iterate through the partnerships to get firstname, lastname, business and AOE
          var mapped_partnerships = await partnerships.map(async (x) => {
            var deets = await database
              .fetchDB()
              .collection("Users")
              .find({ _id: x["mentor"] })
              .toArray();
            var aoe = await mappingUtils.getRelevantTagObjectsFromBinaryArray(
              deets[0]["aoe"]
            );
            return {
              ...x,
              first_name: deets[0]["first_name"],
              last_name: deets[0]["last_name"],
              business: deets[0]["business"],
              aoe: aoe,
            };
          });

          // Fulfill all the promises, create an object and send to the user
          Promise.allSettled(mapped_partnerships)
            .then((v) => {
              v = v.map((x) => x["value"]);
              obj = {
                ...user_partnerships[0],
                partnerships: v,
              };
            })
            .then(() => {
              res.json(obj);
            });

          // If no detailed info is requested, simply sent mentor and mentee ids
        } else {
          obj = {
            ...user_partnerships[0],
            partnerships: partnerships,
          };
          res.json(obj);
        }
      } else {
        res.json(user_partnerships[0]);
      }
    }
  } catch {
    res.status(400);
  }
});

app.post("/api/milestones" ,  authenticateToken, async (req, res) => {
  try {
    var milestoneArray = req.body.milestones;
    var milestoneDBArray = [];

    for (var i = 0; i < milestoneArray.length; i++) {
      var milestone = {
        user_associated: ObjectId(req.body.user_associated),
        title: milestoneArray[i],
        date_given: new Date(),
        progress: "Incomplete",
      };
      milestoneDBArray.push(milestone);
    }

    database.fetchDB().collection("Milestones").insertMany(milestoneDBArray);
    database
      .fetchDB()
      .collection("Alerts")
      .deleteOne({
        sender: ObjectId(req.body.user_associated),
        user_associated: ObjectId(req.body.user_id),
        type: 6,
      });
    res.status(200).end();
  } catch (err) {
    console.log(err);
    res.status(400).end();
  }
});

app.get("/api/milestones/:id",  authenticateToken, async (req, res) => {
  try {
    var { id } = req.params;

    var response = await database
      .fetchDB()
      .collection("Milestones")
      .find({ user_associated: new ObjectId(id) })
      .toArray();

    res.json(response);
  } catch {
    res.status(400).end();
  }
});

app.put("/api/milestones/:id",  authenticateToken, async (req, res) => {
  try {
    var { id } = req.params;
    var obj = req.body;

    database
      .fetchDB()
      .collection("Milestones")
      .updateOne({ _id: ObjectId(id) }, { $set: obj });
    res.status(200).end();
  } catch {
    res.status(400).end();
  }
});

app.delete("/api/milestones/:id",  authenticateToken, async (req, res) => {
  try {
    var { id } = req.params;

    await database
      .fetchDB()
      .collection("Milestones")
      .deleteOne({ _id: new ObjectId(id) });
    res.status(200).end();
  } catch {
    res.status(400).end();
  }
});

// app.post("/api/tags", async (req, res) => {
//   const TagsCollection = database.fetchDB().collection("Tags");
//   Tags = await TagsCollection.find({}).toArray();
//   res.status(200);
//   res.json(Tags);
// });

app.post("/api/tags", authenticateAPIKey, async (req, res) => {
  try {
    const BranchesCollection = await database.fetchDB().collection("Branches");
    var branchName = req.body.branchName;
    var Tags = await BranchesCollection.find({ Name: branchName })
      .project({ _id: 0, Tags: 1 })
      .toArray();
    Tags = Tags[0].Tags;

    res.status(200);
    res.json(Tags);
  } catch {
    res.status(400);
  }
}); 

app.post("/api/appfeedback",  authenticateToken, async (req, res) => {
  try {
    var feedback = {
      user_id: ObjectId(req.body.user_id),
      feedback: req.body.feedback,
      date_created: new Date(),
    };

    database.fetchDB().collection("AppFeedback").insertOne(feedback);
    res.status(200).end();
  } catch {
    res.status(400).end();
  }
});

app.get("/api/appfeedback/", authenticateToken, async (req, res) => {
  try {
    var { id } = req.params;
    var data = await database
      .fetchDB()
      .collection("AppFeedback")
      .find({})
      .toArray();

    for (var i = 0; i < data.length; i++) {
      var user = await database
        .fetchDB()
        .collection("Users")
        .find({ _id: ObjectId(data[i].user_id) })
        .toArray();
      data[i].user_id = user[0];
    }

    res.json(data);
  } catch {
    res.status(400).end();
  }
});

app.post("/api/reports", authenticateToken, async (req, res) => {
  try {
    var report = {
      user_id: ObjectId(req.body.user_id),
      report: req.body.report,
      date_created: new Date(),
    };

    database.fetchDB().collection("Reports").insertOne(report);
    res.status(200).end();
  } catch {
    res.status(400).end();
  }
});

app.get("/api/reports",  authenticateToken, async (req, res) => {
  try {
    var data = await database
      .fetchDB()
      .collection("Reports")
      .find({})
      .toArray();
    for (var i = 0; i < data.length; i++) {
      var user = await database
        .fetchDB()
        .collection("Users")
        .find({ _id: ObjectId(data[i].user_id) })
        .toArray();
      data[i].user_id = user[0];
    }
    res.json(data);
  } catch {
    res.status(400).end();
  }
});

app.get("/api/business", authenticateAPIKey, async (req, res) => {
  const BusinessCollection = database.fetchDB().collection("BusinessAreas");
  BusinessAreas = await BusinessCollection.find({}).toArray();
  res.status(200);
  res.json(BusinessAreas);
});

app.get("/api/tags", authenticateAPIKey, async (req, res) => {
  const TagsCollection = database.fetchDB().collection("Tags");
  tags = await TagsCollection.find({}).toArray();
  res.status(200);
  res.json(tags);
});

app.get("/api/branches", authenticateAPIKey, async (req, res) => {
  try {
    //console.log(req.cookies['jwtToken'])
    var branches = await database
      .fetchDB()
      .collection("Branches")
      .find({})
      .project({ Tags: 0 })
      .toArray();

    res.json(branches);
  } catch {
    res.status(400).end();
  }
});

const server = app.listen(PORT, "0.0.0.0", async () => {
  console.log(`STARTED ON ${PORT}`);
  // Connect to db first and then listen?
  await database
    .connectDB()
    .then(() => {
      console.log("Connected to MongoDB");
      app.emit("app_started");
    })
    .catch(() => {
      console.log("Internal server error: can't connect to MongoDB");
    });

  await server_cron.startCron();
  await mstoneCron_manager.startItemObserver();
});

module.exports = { server, app };
