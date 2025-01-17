const cron = require("node-cron");
const wsUtils = require("../AWSS/WorkshopUtils");
const demandProc = require("../AWSS/demand_proc");

// Schedules functions as soon as the server starts
async function startCron() {
  console.log("Cron Service Running");
  await startWSDemandProcessor();
  await wsUtils.wsCron_manager.startItemObserver();
}

async function startWSDemandProcessor() {
  cron.schedule("0 0 * * Monday,Wednesday,Friday", async () => {
    await demandProc.processDemand();
    console.log("Demand Processed");
  });
}

module.exports = { startCron };
