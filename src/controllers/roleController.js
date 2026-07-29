const redis = require("../config/redis");
const { getFirestore } = require("firebase-admin/firestore")

const db = getFirestore(app)


const getRoles = async (req, res) => {
  try {
    const cache = await redis.get("roles");

     if (cache) {

        return res.json({
            success: true,
            source: "Redis",
            data: JSON.parse(cache)
        });

    }

    const snapshot = await db.collection("roles").get();

    if (snapshot.empty) {
      return res.status(200).json({
        success: true,
        totalRoles: 0,
        roles: [],
      });
    }

    const roles = [];

    snapshot.forEach((doc) => {
      roles.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return res.status(200).json({
      success: true,
      totalRoles: roles.length,
      roles,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
    getRoles
}