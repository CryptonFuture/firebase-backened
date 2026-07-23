const { initializeApp, cert, getApps, getApp } = require("firebase-admin/app");
const serviceAccount = require("../../serviceAccountKey.json")

// const firebaseConfig = {
//     apiKey: process.env.FIREBASE_API_KEY,
// };

// const firebaseApp = initializeApp(firebaseConfig);

const app = getApps().length
? getApp
: initializeApp({
    credential: cert(serviceAccount)
});

module.exports = {
    app,
    // firebaseApp
}