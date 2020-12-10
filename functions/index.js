const functions = require('firebase-functions');
const admin = require('firebase-admin');

const api = require('./api');
const scores = require('./scores');
const kpis = require('./kpis');

admin.initializeApp();

const dbHandle = admin.database();
const dbRef = dbHandle.ref(functions.config().dbname);

const runtimeOpts = {
  timeoutSeconds: 300
}

const exportOrgsList = (list) => {
  return list.map(o => ({
    id: o.id,
    name: o.name,
    score: 0
  }))
}

const updatedDbRef = (key, data) => {
  const orgRef = dbRef.child(key);
  orgRef.set(data);
};

const getDbValue = () => {
  return new Promise((resolve, reject) => {
    dbRef.on("value", 
      snapshot => resolve(snapshot.val()), 
      errorObject => reject(new Error("The read failed: " + errorObject.code))
    );
  });
};

const run = async () => {
  const organizations = await api.fetchOrganizations();
  const deals = await api.fetchDeals();
  const persons = await api.fetchPersons();
  const activities = await api.fetchActivities();

  let orgs = exportOrgsList(organizations);
  orgs = scores.setPersonsScore(orgs, persons);
  orgs = scores.setActivitiesScore(orgs, activities);
  orgs = scores.setDealsScore(orgs, deals);

  updatedDbRef('kpis', kpis.calculate(organizations, activities));
  updatedDbRef('organizations', orgs);

  await api.updateOrganizationsScoresinDb(orgs);

  return [orgs, deals, persons, activities];
}

exports.runCalculations = functions.runWith(runtimeOpts).https.onCall(async (data, context) => {
  return await run();
});

exports.scheduledFunctionCrontab = functions.runWith(runtimeOpts).pubsub.schedule('0 3 * * *')
  .timeZone('Europe/Copenhagen')
  .onRun(async (context) => {
    return await run();
  });

exports.blockSignup = functions.auth.user().onCreate(user => {
  return admin.auth().updateUser(user.uid, { disabled: true })
    .then(userRecord => console.log("Auto blocked user", userRecord.toJSON()))
    .catch(error => console.log("Error auto blocking:", error));
});

exports.getAllFilters = functions.https.onCall(async (data, context) => {
  return await api.getAllFilters();
});

exports.createFilters = functions.https.onCall(async (data, context) => {
  const dbData = await getDbValue();
  let scores = [];
  //let res = [];

  const filters = await api.getAllFilters();

  dbData.organizations.forEach(o => {
    if (scores.indexOf(o.score) === -1) scores.push(o.score);
  });

  /* eslint-disable no-await-in-loop */
  for (score of scores) {
    let index = filters.findIndex(f => f.name === api.getFilterName(score));
    if (index === -1) {
      await api.createFilter(score);
    }
  }
  /* eslint-enable no-await-in-loop */

  return scores;
});