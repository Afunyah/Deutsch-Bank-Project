/* 
Describes the methods that calculates the cosine similarity score for each mentor 

@author: siddharthsrivastava
*/

const {ObjectId} = require("mongodb")

const database = require("../../config/database_handler");

/** * Returns all mentors not from business_area
 * @param {string} business_area 
 */
async function getMentors(business_area) {
    var mentors = null

    if (database == null) {
        console.error("Cannot connect to database");
    } else {

        // Extract all the users from the database that don't have the same business_area and are a mentor (i.e. area of expertise != 0)
        mentors = await database.fetchDB().collection("Users").find({"business" : {"$ne" : business_area}, "isMentor" : true, "interests" : {"$exists" : true}}).toArray()

    }

    return mentors
}

/**
 * Calculates the dot product of vectors a and b
 * @param {array} a 
 * @param {array} b 
 * @returns {array} a dot b
 */
function dot(a, b) {
    return a.map((_, index) => a[index] * b[index]).reduce((m,n) => m + n);
}

/**
 * Calculates the magnitude of vector a
 * @param {array} a 
 * @returns |a|
 */
function magnitude(a) {
    return Math.sqrt((a.map((x) => x**2)).reduce((m, n) => m + n));
}


/**
 * Calculates the cosine similarity score between a and b
 * @param {array} a 
 * @param {array} b 
 * @returns element of [0,1]
 */
function calculateCS(a, b) {
    return dot(a, b) / (magnitude(a) * magnitude(b))
}


/**
 * Calculates the most appropriate mentors for the mentee
 * @param {User} mentee 
 * @returns 
 */
async function mentor_recommender(mentee) {

    var mentors = await getMentors(mentee['business'])

    var scores = mentors.map((mentor) => {
        mentor['score'] = calculateCS(mentee['interests'], mentor['aoe']) + mentor['AvgRating']/50
        return mentor
    })
   
    return scores.sort((a, b) => b['score'] - a['score']) 

}

/**
 * Add to the mentoring partnerships collection
 * @param {String} mentee
 * @param {[User]} mentor 
 */
async function scattershot(mentee, mentors) {
    var mentoring_partnerships = await database.fetchDB().collection("MentoringPartnerships");
    var mentoring_status = await database.fetchDB().collection("MentoringStatus");
    
    partnerships = []
    for (const mentor of mentors) {
        partnerships.push({
            "mentee": ObjectId(mentee),
            "mentor": mentor["_id"],
            "mentor_status": "Pending",
            "mentee_status": "Pending",
            "sc_score": mentor['score']
        })
    }

    var obj = {
        "mentee": ObjectId(mentee),
        "status": "Awaiting Mentors",
    }

    mentoring_status.insertOne(obj);
    mentoring_partnerships.insertMany(partnerships);
}

module.exports =  {mentor_recommender, scattershot};