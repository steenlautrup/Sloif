import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/functions';
import "firebase/auth";
import "firebase/database";

const app = firebase.initializeApp({
  projectId: 'b2b-presales',
  apiKey: 'AIzaSyBO41sxgUVVzmjiJ6TOASB-E4Pns_fvMr4',
  databaseURL: 'https://b2b-presales.firebaseio.com/'
});

firebase.functions();
firebase.database();

export default app;