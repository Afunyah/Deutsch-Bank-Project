/*  This is be a scheduled function. Will run frequently at a set time.  */
const { ObjectId } = require("mongodb");
const database = require("../../config/database_handler");
const gns = require("../GNS/general-notification-system");

const minWSdemand = 250;

async function processDemand() {
  var branches = await getBranches();

  await Promise.all(branches.map(async (branch) => {
    var tags = getBranchTags(branch);
    var recommendedTags = processWorskshopDemand(tags);
    await setRecommendedTags(branch.Name, recommendedTags);

    await Promise.all(recommendedTags.map(async (tag) => {
      await notifyExperts(tag, branch.Name);
    }));
  }));
}

async function notifyExperts(tag, branchName) {
  var alreadyNotified = tag.Demand.wsRecommendedTo;
  await Promise.all((tag.Experts).map(async (elem) => {
    var isNotified = alreadyNotified.some((e) => {
      return e.toString() === elem.toString();
    });

    if (
      !(isNotified)) {
      var alert = {
        sender: null,
        user_associated: ObjectId(elem),
        message: null,
        type: 10,
        created: new Date().toISOString(),
        details: { tag: tag, branchName: branchName },
      };

      gns.addAlerts([alert]).then(() => {
        gns.sendAlertViaSocket(elem, alert);
      });

      await addRecommendedExpert(ObjectId(elem), branchName, tag.Name);
    }
  }));
}



function getBranchTags(branch) {
  var tags = branch.Tags;
  return tags;
}

async function getBranches() {
  const BranchesCollection = await database.fetchDB().collection("Branches");
  var branches = await BranchesCollection.find({}).toArray();
  return branches;
}

function processWorskshopDemand(Tags) {
  var recommendedTags = [];
  var wsDemand;

  Tags.forEach((elem) => {
    wsDemand = 0;
    wsDemand =
      elem.Demand.current + elem.Demand.watchlist - elem.Demand.N_predicted;

    if (wsDemand > minWSdemand) {
      recommendedTags.push(elem);
    }
  });

  return recommendedTags;
}

async function setRecommendedTags(branchName, recommendedTags) {
  const BranchesCollection = await database.fetchDB().collection("Branches");

  var recommendedTagNames = getTagNames(recommendedTags);

  await BranchesCollection.updateMany(
    { Name: branchName },
    { $set: { "Tags.$[elem].wsRecommended": false } },
    { arrayFilters: [{ "elem.Name": { $not: { $in: recommendedTagNames } } }] }
  );

  await BranchesCollection.updateMany(
    { Name: branchName },
    { $set: { "Tags.$[elem].wsRecommended": true } },
    { arrayFilters: [{ "elem.Name": { $in: recommendedTagNames } }] }
  );
}

function getTagNames(tagArray) {
  var tagNames = tagArray.map((elem) => {
    return elem.Name;
  });
  return tagNames;
}

async function addRecommendedExpert(expertID, branchName, tagName) {
  const BranchesCollection = await database.fetchDB().collection("Branches");

  await BranchesCollection.updateOne(
    { Name: branchName },
    { $push: { "Tags.$[elem].Demand.wsRecommendedTo": expertID } },
    { arrayFilters: [{ "elem.Name": tagName }] }
  );
}

module.exports = { processDemand };
