const { ObjectID } = require("bson");
const { ObjectId, ISODate } = require("mongodb");
const database = require("../../config/database_handler");
const cronManager = require("../cron_jobs/generic_cron_manager");
const gns = require("../GNS/general-notification-system");
const mappingUtils = require("../mrs/mappingUtils");

const wsCron_manager = new cronManager.cronManager(
  "WorkshopCronJobs",
  cronExecutor
);

async function cronExecutor(job) {
  try {
    switch (job.executionType) {
      case 1:
        // console.log("Executing Job: Execution Type 1 - Ending Workshop");
        await this.deleteCronJob(job);
        await endWorkshop(job.itemID);
        break;
      default:
        console.log("excution type unknown");
        break;
    }
  } catch (error) {
    console.log(error);
  }
}

async function createWorkshop(mentorIDs, info) {
  try {
    const WorkshopsCollection = await database
      .fetchDB()
      .collection("Workshops");
    const UserCollection = await database.fetchDB().collection("Users");

    var booked = 0;
    var menteeIds = [];

    var newMentorIds = mentorIDs.map((elem) => {
      return ObjectID(elem);
    });

    var workshop = {
      Tag: info.tag.Name,
      Name: info.name,
      Capacity: Number(info.capacity),
      ExpertIds: newMentorIds,
      MenteeIds: menteeIds,
      Details: {
        StartDateTime: new Date(info.details.startDateTime),
        EndDateTime: new Date(info.details.endDateTime),
        Location: info.details.location,
        isOnline: info.details.isOnline,
        branch: info.details.branch,
      },
      N_Booked: booked,
    };

    var result = await WorkshopsCollection.insertOne(workshop);

    await wsCron_manager.createCronJob(workshop, 1);

    if (info.details.isOnline) {
      const BranchesCollection = await database
        .fetchDB()
        .collection("Branches");
      var branches = await BranchesCollection.find({}).toArray();

      await Promise.all(
        branches.map(async (branch) => {
          await notifyWatchlist(info.tag._id, branch.Name, workshop);
        })
      );
    } else {
      await notifyWatchlist(info.tag._id, info.details.branch, workshop);
    }

    return result;
  } catch (error) {
    console.log(error);
  }
}

async function deleteWorkshop(expertID, workshopID) {
  try {
    const WorkshopsCollection = await database
      .fetchDB()
      .collection("Workshops");
    const WSCronCollection = await database
      .fetchDB()
      .collection("WorkshopCronJobs");

    var workshop = await WorkshopsCollection.findOne({
      _id: workshopID,
    });

    var cronJob = await WSCronCollection.findOne({ workshopID: workshopID });

    var hostExpertID = workshop.ExpertIds[0];
    var usersInvolved = workshop.MenteeIds.concat(workshop.ExpertIds);

    if (expertID !== hostExpertID) {
      return;
    }

    await WorkshopsCollection.deleteOne({ _id: workshopID });
    await wsCron_manager.deleteCronJob(cronJob);

    var menteeIds = workshop.MenteeIds;
    await Promise.all(
      menteeIds.map(async (elem) => {
        await unBookWorkshop(elem, workshop._id);
      })
    );

    usersInvolved.forEach((elem) => {
      var alert = {
        sender: null,
        user_associated: elem,
        message: null,
        type: 12,
        created: new Date().toISOString(),
        details: null,
      };

      gns.addAlerts([alert]).then(() => {
        gns.sendAlertViaSocket(elem, alert);
      });
    });
  } catch (error) {
    console.log(error);
  }
}

async function endWorkshop(workshopID) {
  try {
    const WorkshopsCollection = await database
      .fetchDB()
      .collection("Workshops");

    var workshop = await WorkshopsCollection.findOne({
      _id: workshopID,
    });

    var menteeIds = workshop.MenteeIds;

    await Promise.all(
      menteeIds.map(async (elem) => {
        await unBookWorkshop(elem, workshopID);
        var alert = {
          sender: workshop.ExpertIds[0],
          user_associated: elem,
          message: null,
          type: 8,
          created: new Date().toISOString(),
          details: { item: workshop },
        };

        gns.addAlerts([alert]).then(() => {
          gns.sendAlertViaSocket(elem, alert);
        });
      })
    );

    await WorkshopsCollection.deleteOne({ _id: workshopID });
  } catch (error) {
    console.log(error);
  }
}

async function editWorkshop(workshopID, newWorkshop) {
  try {
    const WorkshopsCollection = await database
      .fetchDB()
      .collection("Workshops");

    var oldWorkshop = await WorkshopsCollection.findOne({ _id: workshopID });

    if (newWorkshop.Capacity < oldWorkshop.N_Booked) {
      return;
    }

    if (newWorkshop.Details.StartDateTime.getTime() <= Date.now()) {
      return;
    }

    const Workshop = {
      Tag: oldWorkshop.Tag,
      Name: newWorkshop.Name,
      Capacity: newWorkshop.Capacity,
      ExpertIds: newWorkshop.ExpertIds,
      MenteeIds: oldWorkshop.MenteeIds,
      Details: {
        StartDateTime: newWorkshop.Details.StartDateTime,
        Duration: newWorkshop.Details.Duration,
        Location: newWorkshop.Details.wsLocation,
        isOnline: newWorkshop.Details.isOnline,
        branch: oldWorkshop.Details.branch,
      },
      N_Booked: oldWorkshop.N_Booked,
    };

    await WorkshopsCollection.replaceOne({ _id: workshopID }, Workshop);
    // await wsCron_manager.updateCronJob(Workshop);

    var usersInvolved = oldWorkshop.MenteeIds.concat(oldWorkshop.ExpertIds);

    usersInvolved.forEach((elem) => {
      var alert = {
        sender: null,
        user_associated: elem,
        message: null,
        type: 13,
        created: new Date().toISOString(),
        details: null,
      };

      gns.addAlerts([alert]).then(() => {
        gns.sendAlertViaSocket(elem, alert);
      });
    });
  } catch (error) {
    console.log(error);
  }
}

async function bookWorkshop(menteeID, workshopID) {
  try {
    const WorkshopsCollection = await database
      .fetchDB()
      .collection("Workshops");
    const UserCollection = await database.fetchDB().collection("Users");
    const BranchesCollection = await database.fetchDB().collection("Branches");

    var mentee = await UserCollection.findOne({ _id: menteeID });
    var userBranch = await BranchesCollection.findOne({ Name: mentee.branch });

    var workshop = await WorkshopsCollection.findOne({ _id: workshopID });
    if (
      workshop.MenteeIds.some((elem) => {
        return elem.toString() === menteeID.toString();
      })
    ) {
      return;
    }

    if (workshop.N_Booked >= workshop.Capacity) {
      return;
    }

    await WorkshopsCollection.updateOne(
      { _id: workshopID },
      { $push: { MenteeIds: menteeID }, $inc: { N_Booked: 1 } }
    );

    await updateTagDemand(workshop.Tag, 1, userBranch.Name);
  } catch (error) {
    console.log(error);
  }
}

async function unBookWorkshop(menteeID, workshopID) {
  try {
    const WorkshopsCollection = await database
      .fetchDB()
      .collection("Workshops");
    const UserCollection = await database.fetchDB().collection("Users");
    const BranchesCollection = await database.fetchDB().collection("Branches");

    var mentee = await UserCollection.findOne({ _id: menteeID });
    var userBranch = await BranchesCollection.findOne({ Name: mentee.branch });

    var workshop = await WorkshopsCollection.findOne({ _id: workshopID });

    if (
      !workshop.MenteeIds.some((elem) => {
        return elem.toString() === menteeID.toString();
      })
    ) {
      return;
    }

    await WorkshopsCollection.updateOne(
      { _id: workshopID },
      { $pull: { MenteeIds: menteeID }, $inc: { N_Booked: -1 } }
    );

    await updateTagDemand(workshop.Tag, -1, userBranch.Name);
  } catch (error) {
    console.log(error);
  }
}

async function updateTagsCurrentCount(userID, newTags) {
  try {
    const BranchesCollection = await database.fetchDB().collection("Branches");
    const UserCollection = await database.fetchDB().collection("Users");

    var user = await UserCollection.findOne({ _id: userID });
    var branchName = user.branch;
    var oldTags = user.interests;

    var oldTagArray = await mappingUtils.convertbinaryToTagNames(oldTags);
    var newTagArray = await mappingUtils.convertbinaryToTagNames(newTags);

    if (oldTagArray.length == newTagArray.length) {
      var compArray = oldTagArray.map((oldElem) => {
        if (newTagArray.includes(oldElem)) {
          return true;
        }
        return false;
      });

      if (
        compArray.every((elem) => {
          return elem;
        })
      ) {
        return;
      }
    }

    console.log(branchName);
    console.log("Old: " + oldTagArray);
    console.log("New: " + newTagArray);

    await Promise.all(
      oldTagArray.map(async (element) => {
        await BranchesCollection.updateOne(
          { Name: branchName, "Tags.Name": element },
          { $inc: { "Tags.$.Demand.current": -1 } }
        );
      })
    );

    await Promise.all(
      newTagArray.map(async (element) => {
        await BranchesCollection.updateOne(
          { Name: branchName, "Tags.Name": element },
          { $inc: { "Tags.$.Demand.current": 1 } }
        );
      })
    );
  } catch (error) {
    console.log(error);
  }
}

async function updateTagDemand(tag, val, branchName) {
  try {
    const BranchesCollection = await database.fetchDB().collection("Branches");
    await BranchesCollection.updateOne(
      { Name: branchName, "Tags.TagID": tag },
      { $inc: { "Tags.$.Demand.N_predicted": val } }
    );
  } catch (error) {
    console.log(error);
  }
}

async function addTagToWatchlist(menteeID, TagName, branchName) {
  try {
    const UsersCollection = await database.fetchDB().collection("Users");
    const BranchesCollection = await database.fetchDB().collection("Branches");

    var mentee = await UsersCollection.findOne({ _id: menteeID });

    if (mentee.watchlist.includes(TagName)) {
      return;
    }

    await UsersCollection.updateOne(
      { _id: menteeID },
      { $push: { watchlist: TagName } }
    );

    await BranchesCollection.updateOne(
      { Name: branchName, "Tags.Name": TagName },
      {
        $inc: { "Tags.$.Demand.watchlist": 1 },
        $push: { "Tags.$.Demand.wsWatchers": menteeID },
      }
    );
  } catch (error) {
    console.log(error);
  }
}

async function removeTagFromWatchlist(menteeID, TagName, branchName) {
  try {
    const UsersCollection = await database.fetchDB().collection("Users");
    const BranchesCollection = await database.fetchDB().collection("Branches");
    var mentee = await UsersCollection.findOne({ _id: menteeID });

    if (!mentee.watchlist.includes(TagName)) {
      return;
    }

    var mentee = UsersCollection.updateOne(
      { _id: menteeID },
      { $pull: { watchlist: TagName } }
    );
    await BranchesCollection.updateOne(
      { Name: branchName, "Tags.Name": TagName },
      {
        $inc: { "Tags.$.Demand.watchlist": -1 },
        $pull: { "Tags.$.Demand.wsWatchers": menteeID },
      }
    );
  } catch (error) {
    console.log(error);
  }
}

async function updateWatchlist(menteeID, newWatchlist, branchName) {
  try {
    if (newWatchlist == null) {
      newWatchlist = [];
    }

    const UsersCollection = await database.fetchDB().collection("Users");
    var mentee = await UsersCollection.findOne({ _id: menteeID });

    var oldWatchlist = mentee.watchlist;

    var toRemove = oldWatchlist.filter((elem) => {
      return !newWatchlist.includes(elem);
    });

    var toAdd = newWatchlist.filter((elem) => {
      return !oldWatchlist.includes(elem);
    });

    if (toRemove.length > 0) {
      await Promise.all(
        toRemove.map(async (elem) => {
          await removeTagFromWatchlist(menteeID, elem, branchName);
        })
      );
    }
    if (toAdd.length > 0) {
      await Promise.all(
        toAdd.map(async (elem) => {
          await addTagToWatchlist(menteeID, elem, branchName);
        })
      );
    }
  } catch (error) {
    console.log(error);
  }
}

async function notifyWatchlist(tagId, branch, workshop) {
  try {
    const BranchesCollection = await database.fetchDB().collection("Branches");
    var someBranch = await BranchesCollection.findOne({ Name: branch });
    var someTag = someBranch.Tags.find((elem) => {
      return elem._id.toString() === tagId;
    });

    var watchers = someTag.Demand.wsWatchers;

    watchers.forEach((elem) => {
      var alert = {
        sender: workshop.ExpertIds[0],
        user_associated: elem,
        message: null,
        type: 9,
        created: new Date().toISOString(),
        details: { item: workshop },
      };

      gns.addAlerts([alert]).then(() => {
        gns.sendAlertViaSocket(elem, alert);
      });
    });
  } catch (error) {
    console.log(error);
  }
}

async function removeRecommendedExpert(expertID, branchName, tagName) {
  try {
    const BranchesCollection = await database.fetchDB().collection("Branches");

    await BranchesCollection.updateOne(
      { Name: branchName },
      { $pull: { "Tags.$[elem].Demand.wsRecommendedTo": expertID } },
      { arrayFilters: [{ "elem.Name": tagName }] }
    );
  } catch (error) {
    console.log(error);
  }
}

async function getRecommendedTags(branchName) {
  try {
    const BranchesCollection = await database.fetchDB().collection("Branches");
    var branch = await BranchesCollection.findOne({
      Name: branchName,
    });

    var Tags = branchName.Tags;

    var recommendedTags = Tags.filter((elem) => {
      return (elem.Demand.wsRecommended = true);
    });

    var recommendedTagsNames = recommendedTags.map((elem) => {
      return elem.Name;
    });

    return recommendedTagsNames;
  } catch (error) {
    console.log(error);
  }
}

async function getExpertsRecommendedTags(expertID) {
  try {
    var expertTags = [];

    var recommendedWorkshops = [];

    var recTags = await getRecommendedTags();
    expertTags = expertTags.filter((elem) => {
      return recTags.includes(elem);
    });

    const WorkshopsCollection = await database
      .fetchDB()
      .collection("Workshops");

    var tagWorkshops = await WorkshopsCollection.find({
      Tag: { $in: expertTags },
    }).toArray();

    tagWorkshops.forEach((element) => {
      if (
        element.experts.every((item) => {
          return item !== expertID;
        })
      ) {
        recommendedWorkshops.push(element);
      }
    });

    return recommendedWorkshops;
  } catch (error) {
    console.log(error);
  }
}

async function getCurrentWorkshops(userBranch, userID) {
  try {
    const WorkshopsCollection = await database
      .fetchDB()
      .collection("Workshops");
    var workshopsAvailable = await WorkshopsCollection.aggregate([
      {
        $match: {
          $and: [
            {
              $or: [
                { "Details.branch": userBranch },
                { "Details.isOnline": true },
              ],
            },
            { $expr: { $lt: ["$N_Booked", "$Capacity"] } },
            { MenteeIds: { $not: { $all: [userID] } } },
          ],
        },
      },
      {
        $lookup: {
          from: "Users",
          localField: "ExpertIds",
          foreignField: "_id",

          pipeline: [
            { $project: { _id: 1, first_name: 1, last_name: 1, email: 1 } },
          ],
          as: "expertdetails",
        },
      },
    {$sort : {"Details.StartDateTime" : 1}},
    {
      $project: {
        Name: 1,
        _id: 1,
        Tag: 1,
        expertdetails: 1,
        date: "$Details.StartDateTime",
        location : "$Details.Location",
        isOnline : "$Details.isOnline",
        capacity: "$Capacity",
        nBooked: "$N_Booked"
      },
    }
    ]).toArray();

    return workshopsAvailable;
  } catch (error) {
    console.log(error);
  }
}

async function getBookedWorkshops(menteeID) {
  try {
    const WorkshopsCollection = await database
      .fetchDB()
      .collection("Workshops");
    var bookedWorkshops = await WorkshopsCollection.aggregate([
      { $match: { MenteeIds: menteeID } },
      {
        $lookup: {
          from: "Users",
          localField: "ExpertIds",
          foreignField: "_id",

          pipeline: [
            { $project: { _id: 0, first_name: 1, last_name: 1, email: 1 } },
          ],
          as: "expertdetails",
        },
      },
    {$sort : {"Details.StartDateTime" : 1}},
    {
      $project: {
        Name: 1,
        _id: 1,
        expertdetails: 1,
        date: "$Details.StartDateTime",
        location : "$Details.Location",
        isOnline : "$Details.isOnline",
        capacity: "$Capacity",
        nBooked: "$N_Booked"
      },
    }
    ]).toArray();

    if (bookedWorkshops.length == 0) {
      return [];
    }
    return bookedWorkshops;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  wsCron_manager,
  createWorkshop,
  endWorkshop,
  deleteWorkshop,
  editWorkshop,
  bookWorkshop,
  unBookWorkshop,
  addTagToWatchlist,
  removeTagFromWatchlist,
  updateTagsCurrentCount,
  updateWatchlist,
  getCurrentWorkshops,
  getBookedWorkshops,
  removeRecommendedExpert,
};
