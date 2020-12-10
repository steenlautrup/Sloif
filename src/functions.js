import firebase from 'firebase/app';
//import axios from 'axios';

const runCalculations = async () => {
  console.log('run calc start');
  const fn = firebase.functions().httpsCallable('runCalculations');
  
  try {
    const res = await fn({});  
    console.log(res);
    return res.data[0];
  } catch(err) {
    return new Error(err);
  }
};

const getAllFilters = async () => {
  const fn = firebase.functions().httpsCallable('getAllFilters');
  try {
    const res = await fn({});
    console.log(res);
    return res.data;
  } catch(err) {
    return new Error(err);
  }
};

const createFilters = async () => {
  console.log('creat filters start');
  const fn = firebase.functions().httpsCallable('createFilters');

  try {
    const res = await fn({});
    console.log(res);
    
    return true;
  } catch(err) {
    return new Error(err);
  }
};

export { runCalculations, getAllFilters, createFilters };