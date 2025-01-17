const { ObjectId } = require("mongodb");
const database = require("../../config/database_handler");

async function getSchedule(userID) {
    const MeetingsCollection = await database.fetchDB().collection("Meetings");

    var meetings = await MeetingsCollection.aggregate(
        [   { $match: { $or: [{ "mentor_id": userID }, { "mentee_id": userID }], $and : [{"status" : "Upcoming"}] }},
            { $project: { _id: 0, "Name": "$meeting_title", "date": "$StartDateTime", "location": 1}},
            { $unionWith: {coll : "Workshops", 
                pipeline: [
                    { $match: { $or: [{ "ExpertIds": userID }, { "MenteeIds": userID }] }},
                    { $project: { _id: 0, Name: 1, "date": "$Details.StartDateTime", "location": "$Details.Location"}}
                ]}},

            { $unionWith: {coll: "GroupSessions",
                pipeline: [
                    { $match: { $or: [{ "Expert": userID }, { "Mentee.Accepted": userID }] }},
                    { $project: { _id: 0 , Name: 1, "date": "$Details.StartDateTime", "location": "$Details.Location"}}

                ]}},
            {$sort : {"date" : 1}}
        ]
    ).toArray();

    return meetings;
}

module.exports = {
    getSchedule
}