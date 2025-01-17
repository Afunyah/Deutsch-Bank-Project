const cron = require("node-cron");
const database = require("../../config/database_handler");
// const wsUtils = require("../AWSS/WorkshopUtils");

/**
 * Cron is not the smartest way to go about this
 * Add last executed field and repeat fields to work with actual cron jobs
 */

// Maybe stop passing cronCollection as a reference?

class cronManager {
  constructor(cronCollectionName, executor) {
    this.cronCollectionName = cronCollectionName;
    this.cronCollection = null;
    this.executor = executor;
    this.local_cron = [];
  }

  async setCronCollection() {
    try {
      this.cronCollection =
        this.cronCollection == null
          ? await database.fetchDB().collection(this.cronCollectionName)
          : this.cronCollection;
    } catch (error) {
      console.log(error);
    }
  }

  async createCronJob(item, executionType) {
    try {
      var itemID = item._id;
      var start = item.Details.StartDateTime;
      var end = item.Details.EndDateTime;
      var params = null;
      try {
        params = item.params;
      } catch {
        params = null;
      }

      var cronJob = {
        itemID: itemID,
        jobStartTime: end,
        executionType: executionType,
        params: params,
      };

      await this.setCronCollection();
      const result = await this.cronCollection.insertOne(cronJob);
      cronJob._id = result.insertedId;
      await this.observeItem(cronJob);
    } catch (error) {
      console.log(error);
    }
  }

  async startItemObserver() {
    try {
      await this.setCronCollection();
      var allJobs = await this.cronCollection.find({}).toArray();
      var executeArray = [];
      var watchArray = [];

      var currMilli = Date.now();

      await allJobs.forEach((job) => {
        if (job.jobStartTime.getTime() <= currMilli + 60 * 1000) {
          executeArray.push(job);
        } else {
          watchArray.push(job);
        }
      });

      await Promise.all(
        watchArray.map(async (job) => {
          await this.observeItem(job);
        })
      );

      await Promise.all(
        executeArray.map(async (job) => {
          await this.executor(job);
        })
      );
    } catch (error) {
      console.log(error);
    }
  }

  async observeItem(job) {
    try {
      var month = job.jobStartTime.getMonth() + 1;
      var date = job.jobStartTime.getDate();
      var hours = job.jobStartTime.getHours();
      var minutes = job.jobStartTime.getMinutes();
      var seconds = job.jobStartTime.getSeconds();

      var task = cron.schedule(
        `${seconds} ${minutes} ${hours} ${date} ${month} *`,
        async () => {
          await this.executor(job);
        }
      );

      this.local_cron.push({
        jobID: job._id,
        task: task,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async updateCronJob(item) {
    try {
      await this.setCronCollection();
      var cronJob = await this.cronCollection.findOne({ itemID: item._id });
      await this.deleteCronJob(cronJob);
      await this.createCronJob(item);
    } catch (error) {
      console.log(error);
    }
  }

  async deleteCronJob(job) {
    try {
      await this.setCronCollection();
      await this.cronCollection.deleteOne({ _id: job._id });
      var jIndex = this.local_cron.findIndex((elem) => {
        return elem.jobID === job._id;
      });

      if (
        this.local_cron[jIndex] !== undefined &&
        this.local_cron[jIndex] !== undefined
      ) {
        this.local_cron[jIndex].task.stop();
        this.local_cron.splice(jIndex, 1);
      }
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = {
  cronManager,
};
