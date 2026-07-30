const { initializeApp, cert, getApps, getApp } = require("firebase-admin/app");
const keyPath = path.resolve(__dirname, '../../serviceAccountKey.json');

const serviceAccount = JSON.parse(
  fs.readFileSync(keyPath, 'utf8').replace(/^\uFEFF/, '') 
);

const app = getApps().length
? getApp
: initializeApp({
    credential: cert(serviceAccount)
});

module.exports = {
    app,
}