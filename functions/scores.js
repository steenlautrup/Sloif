const utils = require('./utils');

const getOrgById = (orgs, id) => {
  return orgs.find(o => (''+o.id) === (''+id));
};

const setScoreForMissingOrgs = (orgs, list) => {
  return orgs.map(o => {
    if (list.indexOf(o.id) === -1) {
      o.score += 1;
    }
    return o;
  });
};

const addHighestScoreToOrg = (map, orgs) => {
  Object.keys(map).forEach(id => {
    let org = getOrgById(orgs, id);
    if (!org) return;
    let score = Math.max(...map[id]);
    org.score += score;
  });
  return orgs;
};

const setPersonsScore = (organizations, persons) => {
  let orgsWithContacts = [];
  let orgs = [...organizations];

  persons.forEach(p => {
    if (!p.org_id || !p.org_id.value) return;

    let org = getOrgById(orgs, p.org_id.value);
    if (!org) return;
    
    if (org && orgsWithContacts.indexOf(org.id) === -1) {
      org.score += 100;
      orgsWithContacts.push(org.id);
    }
  });

  orgs = setScoreForMissingOrgs(orgs, orgsWithContacts);
  return orgs;
};

const setActivitiesScore = (organizations, activities) => {
  let orgsWithActivities = {};
  let orgs = [...organizations];

  activities.forEach(a => {
    let score = 0;
    let orgId = a.org_id;
    
    if (!a.due_date || !orgId || a.done || !getOrgById(orgs, orgId)) return;

    let dueDateStatus = utils.getDueDateStatus(a.due_date, a.due_time);

    if (dueDateStatus === 'overdue') score = 50;
    if (dueDateStatus === 'upcoming_within_week') score = 1000;

    if (score > 0) {
      if (orgsWithActivities[orgId]) {
        orgsWithActivities[orgId].push(score);
      } else {
        orgsWithActivities[orgId] = [score];
      }
    }
  });

  orgs = addHighestScoreToOrg(orgsWithActivities, orgs);
  orgs = setScoreForMissingOrgs(orgs, Object.keys(orgsWithActivities).map(k => 1*k));

  return orgs;
};

const setDealsScore = (organizations, deals) => {
  let orgsWithDeals = {};
  let orgs = [...organizations];

  deals.forEach(d => {
    let score = 0;
    if (!d.org_id || !d.org_id.value) return;
    let orgId = d.org_id.value;

    switch (d.status) {
      case 'open': score = 100; break;
      case 'won': score = 50; break;
      case 'lost': score = 25; break;
    }

    if (score > 0) {
      if (orgsWithDeals[orgId]) {
        orgsWithDeals[orgId].push(score);
      } else {
        orgsWithDeals[orgId] = [score];
      }
    }
  });

  orgs = addHighestScoreToOrg(orgsWithDeals, orgs);
  orgs = setScoreForMissingOrgs(orgs, Object.keys(orgsWithDeals).map(k => 1 * k));

  return orgs;
};

module.exports = { setPersonsScore, setActivitiesScore, setDealsScore };