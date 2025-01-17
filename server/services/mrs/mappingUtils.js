const database = require("../../config/database_handler");

// addnewtags; update arrays
// removetags: update arrays *** maybe not needed

async function getOrderedTagArray() {
  const TagsCollection = await database.fetchDB().collection("Tags");
  var tags = await TagsCollection.find({}).sort({ index: 1 }).toArray();
  return tags;
}

async function getTotalTagCount() {
  var tags = await getOrderedTagArray();
  return tags.length;
}

// get all tag objects where binary array value is 1.
async function getRelevantTagObjectsFromBinaryArray(binaryArray) {
  const Tags = await getOrderedTagArray();
  const relevantTagObjectArray = [];
  binaryArray.map((elem, index) => {
    if (elem) {
      relevantTagObjectArray.push(Tags[index]);
    }
  })
  return relevantTagObjectArray;
}

// get mentors aoe
async function getMentorExpertiseBinary(mentorId) {
  const UserCollection = await database.fetchDB().collection("Users");
  var mentor = await UserCollection.findOne({ _id: mentorId });
  // console.log(mentor.aoe)
  return mentor.aoe;
}

// get mentors tags
async function getMentorExpertiseStrings(mentorId) {
  var binaryTagArray = await getMentorExpertiseBinary(mentorId);

  var expertiseTagNames = await convertbinaryToTagNames(binaryTagArray);
  console.log(expertiseTagNames);
  return expertiseTagNames;
}

// Convert [0 1 ...] to [tagObj1 tagObj2 ..]
async function convertbinaryToTags(binArr) {
  var orderedTagArray = await getOrderedTagArray();
  var result = orderedTagArray.filter((elem) => {
    return binArr[elem.index];
  });
  return result;
}

// Convert [0 1 ...] to ['Tag Name1' ' Tag Name2' ..]
async function convertbinaryToTagNames(binArr) {
  var tagArr = await convertbinaryToTags(binArr);
  var tagNames = await getNamesFromTags(tagArr);
  return tagNames;
}

// Convert [tagObj1 tagObj2 ..] to [ 0 1 ....]
async function convertTagsToBinary(tagArray) {
  var len = await getTotalTagCount();
  var binArr =  new Array(len);
  binArr.fill(0);
  tagArray.forEach((elem) => {
    binArr[elem.index] = 1;
  });

  return binArr;
}

// Convert ['Tag Name1' ' Tag Name2' ..] to [ 0 1 ....]
async function convertTagNamesToBinary(tagNames) {
  var tagArr = await getTagsFromNames(tagNames);
  var binArr = await convertTagsToBinary(tagArr);
  return binArr;
}

// Get 'Tag Names' from tag object {_id:id, Name:name, etc}
async function getNamesFromTags(tagArr) {
  var tagNames = tagArr.map((elem) => {
    return elem.Name;
  });
  return tagNames;
}

// Get tag objects {_id:id, Name:name, etc} from 'Tag Name'
async function getTagsFromNames(tagNames) {
  var orderedTagArray = await getOrderedTagArray();
  if (tagNames === undefined) {
    return [];
  }
  var result = orderedTagArray.filter((elem) => {
    return tagNames.includes(elem.Name);
  });
  return result;
}

module.exports = {
  getOrderedTagArray,
  getRelevantTagObjectsFromBinaryArray,
  getMentorExpertiseBinary,
  getMentorExpertiseStrings,
  convertTagNamesToBinary,
  convertTagsToBinary,
  convertbinaryToTagNames,
  convertbinaryToTags,
  getTagsFromNames,
  getNamesFromTags,
  getTotalTagCount
};
