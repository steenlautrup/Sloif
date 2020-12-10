const axios = require('axios');
const functions = require('firebase-functions');

// available params
//functions.config().pipedrive.token
//functions.config().pipedrive.url
//functions.config().pipedrive.domain

const baseUrl = `https://${functions.config().pipedrive.domain}.pipedrive.com/v1/`;

const defaultParams = {
  api_token: functions.config().pipedrive.token,
  limit: 500,
  start: 0
};

const getApiTokenParam = () => {
  return `?api_token=${functions.config().pipedrive.token}`;
}

const fetchData = async (url, params) => {
  let loadData = true;
  let result = [];
  let start = 0;

  const sendRequest = async (start) => {
    return await axios.get(url, { params: {...params, start} });
  }
  
  /* eslint-disable no-await-in-loop */
  while (loadData) {
    let response = await sendRequest(start);

    if (response.status === 200 && response.data.success) {
      response.data.data && (result = result.concat(response.data.data));
        
      if (response.data.additional_data.pagination.more_items_in_collection === false) {
        loadData = false;
      }

    } else {
      loadData = false;
    }
    
    start += 500;
  }
  /* eslint-enable no-await-in-loop */

  return result;
};

const fetchOrganizations = async () => {
  try {
    return await fetchData(`${baseUrl}organizations`, defaultParams);  
  } catch (err) {
    return new Error('Error fetching data', err);
  }
}

const fetchDeals = async () => {
  try {
    return await fetchData(`${baseUrl}deals`, defaultParams);
  } catch (err) {
    return new Error('Error fetching data');
  }
}

const fetchPersons = async () => {
  try {
    return await fetchData(`${baseUrl}persons`, defaultParams);
  } catch (err) {
    return new Error('Error fetching data');
  }
}

const fetchActivities = async () => {
  try {
    return await fetchData(`${baseUrl}activities`, defaultParams);
  } catch (err) {
    return new Error('Error fetching data');
  }
}

const timeout = ms => new Promise(res => setTimeout(res, ms))

const updateOrganizationsScoresinDb = async (organizations) => {
  let batchNum = 20;
  // split organizations into chunks
  let iterations = [...Array(Math.ceil(organizations.length / batchNum)).keys()];

  const getUrl = (id) => {
    return `${baseUrl}organizations/${id}${getApiTokenParam()}`;
  };

  /* eslint-disable no-await-in-loop */
  for (const iteration of iterations) {
    let start = iteration * batchNum;
    
    let requestsBatch = organizations.slice(start, start + batchNum).map((o) => {
      return axios.put(getUrl(o.id), { [functions.config().pipedrive.scorefieldkey]: o.score });
    });

    await Promise.all(requestsBatch);
    await timeout(800);
  }
  /* eslint-enable no-await-in-loop */
};

const getFilterName = (score) => {
  return `b2b-score-${score}`;
};

const getAllFilters = async () => {
  try {
    const res = await axios.get(`${baseUrl}filters${getApiTokenParam()}`);
    if (res.status === 200 && res.data.success) {
      return res.data.data;
    }
  } catch(err) {
    return new Error(err);
  }
}


const createFilter = async (score) => {
  try {
    const res = await axios.post(`${baseUrl}filters${getApiTokenParam()}`, {
      "name": getFilterName(score),
      "visible_to": 1,
      "type": 'org',
      "conditions": {
        "glue": "and", 
        "conditions": [{ 
          "glue": "and", 
          "conditions": [{ 
            "object": "organization", 
            "field_id": functions.config().pipedrive.scorefieldid, 
            "operator": "=", 
            "value": score, 
            "extra_value": null 
          }]
        }, { "glue": "or",  "conditions": [] }]
      },
    });

    return res;

  } catch (err) {
    return new Error(err);
  }
};

module.exports = { 
  fetchOrganizations, 
  fetchDeals, 
  fetchPersons, 
  fetchActivities, 
  updateOrganizationsScoresinDb,
  createFilter,
  getAllFilters,
  getFilterName
};