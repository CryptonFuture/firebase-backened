const { initializeApp, cert, getApps, getApp } = require("firebase-admin/app");
const serviceAccount = require("../../serviceAccountKey.json")

const app = getApps().length
? getApp
: initializeApp({
    credential: cert(serviceAccount)
});

module.exports = {
    app,
}