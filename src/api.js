import firebase from 'firebase/app';

const getOrganizations = () => {
  const ref = firebase.database().ref('organizations').orderByChild('name');
  return ref.once('value').then((snapshot) => {
    let res = [];
    snapshot.forEach(function (child) {
      res.push(child.val());
    });
    return res;
  });
}

const getOrganizationGroups = (orgs) => {
  let groups = [];

  orgs.forEach(o => {
    let group = groups.find(g => g.score === o.score);
    if (group) {
      group.orgs.push(o);
    } else {
      groups.push({
        score: o.score,
        orgs: [o],
        key: o.score
      });
    }
  });

  return groups.sort((a, b) => {
    if ((1 * a.score) < (1 * b.score)) {
      return 1;
    }
    return -1;
  });
};

const getKpis = () => {
  const ref = firebase.database().ref('kpis');
  return ref.once('value').then((snapshot) => snapshot.val());
}

export { getOrganizations, getOrganizationGroups, getKpis };