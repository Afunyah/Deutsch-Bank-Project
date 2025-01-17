const { ObjectId } = require("mongodb");
const database = require("../../config/database_handler");
const cronManager = require("../cron_jobs/generic_cron_manager");
const gns = require("../GNS/general-notification-system");

async function createGroupSession(expertID, menteeIDs, tag, name, details) {
  try {
    const GroupCollection = await database
      .fetchDB()
      .collection("GroupSessions");

    const GroupSession = {
      Name: name,
      Tag: tag,
      Expert: expertID,
      Mentees: {
        Invited: menteeIDs,
        Accepted: [],
      },
      Details: details,
    };

    await GroupCollection.insertOne(GroupSession);

    menteeIDs.forEach((elem) => {
      var alert = {
        sender: expertID,
        user_associated: ObjectId(elem),
        message: null,
        type: 16,
        created: new Date().toISOString(),
        details: { item: GroupSession },
      };

      gns.addAlerts([alert]).then(() => {
        gns.sendAlertViaSocket(elem, alert);
      });
    });
  } catch (error) {
    console.log(error);
  }
}

async function addToAccepted(sessionId, menteeId) {
  try {
    const GroupCollection = await database
      .fetchDB()
      .collection("GroupSessions");

    await GroupCollection.updateOne(
      { _id: sessionId },
      { $push: { "Mentees.Accepted": menteeId } }
    );
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  createGroupSession,
  addToAccepted,
};
