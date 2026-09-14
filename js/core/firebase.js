/* Bitácora PRO v3 - Firebase */
window.Bitacora = window.Bitacora || {};
(function (B) {
  const config = window.BitacoraFirebaseConfig || {
    apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: ''
  };
  const demo = !config.apiKey;
  let auth = null, db = null, FV = null, TS = null;
  if (!demo) {
    firebase.initializeApp(config);
    auth = firebase.auth();
    db = firebase.firestore();
    FV = firebase.firestore.FieldValue;
    TS = firebase.firestore.Timestamp;
  }
  B.firebase = Object.freeze({ config, demo, get auth(){ return auth; }, get db(){ return db; }, FV, TS });
})(window.Bitacora);
