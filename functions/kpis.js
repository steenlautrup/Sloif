const utils = require('./utils');

const activityEffectiveness = (activities) => {
  let upcomingActivities = 0;
  let openActivities = 0;
  if (!activities.length) return null;

  activities.forEach(a => {
    if (!a.due_date) return;

    if (!a.done) {
      openActivities ++;
      let dueDateStatus = utils.getDueDateStatus(a.due_date, a.due_time);
      if (dueDateStatus !== 'overdue') upcomingActivities ++;
    }
  });
  
  return parseFloat(upcomingActivities / openActivities).toFixed(2) * 100;
};

const crmEffectiveness = (organizations, activities) => {
  let orgsWithActivities = [];

  if (!activities.length || !organizations.length) return null;

  activities.forEach(a => {
    if (a.done || !a.org_id) return;

    if (orgsWithActivities.indexOf(a.org_id) === -1) {
      orgsWithActivities.push(a.org_id);
    }
  })

  return parseFloat(orgsWithActivities.length / organizations.length).toFixed(2) * 100;
};

const calculate = (organizations, activities) => {
  let activityEff = activityEffectiveness(activities);
  let crmEff = crmEffectiveness(organizations, activities);

  return {
    activityEffectiveness: activityEff,
    crmEffectiveness: crmEff,
    crmPerformance: parseFloat((activityEff + crmEff) / 2).toFixed(2)
  };
};

module.exports = { activityEffectiveness, crmEffectiveness, calculate };