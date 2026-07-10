const { getAuth } = require("firebase-admin/auth");
const { app } = require("../config/firebase");
const { getFirestore } = require("firebase-admin/firestore")

const db = getFirestore(app)

const updateUserStatus = async (req, res) => {
  try {
    const { uid } = req.params;
    const { disabled } = req.body;

    if (typeof disabled !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "disabled must be true or false",
      });
    }

    // const userRecord = await getAuth(app).updateUser(uid, {
    //   disabled,
    // });

     await db.collection("users").doc(uid).update({
      disabled,
      updatedAt: new Date(),
    });

    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userData = userDoc.data();

    res.status(200).json({
      success: true,
      message: disabled
        ? "User disabled successfully"
        : "User enabled successfully",
      data: {
        uid: userData.uid,
        email: userData.email,
        disabled: userData.disabled,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getUsers = async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();

    if (snapshot.empty) {
      return res.status(200).json({
        success: true,
        totalUsers: 0,
        users: [],
      });
    }

    const users = [];

    snapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return res.status(200).json({
      success: true,
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getActiveUsers = async (req, res) => {
  try {
    const snapshot = await db
      .collection("users")
      .where("disabled", "==", true)
      .get();

    if (snapshot.empty) {
      return res.status(200).json({
        success: true,
        totalUsers: 0,
        users: [],
      });
    }

    const users = [];

    snapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return res.status(200).json({
      success: true,
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getInactiveUsers = async (req, res) => {
  try {
    const snapshot = await db
      .collection("users")
      .where("disabled", "==", false)
      .get();

    if (snapshot.empty) {
      return res.status(200).json({
        success: true,
        totalUsers: 0,
        users: [],
      });
    }

    const users = [];

    snapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return res.status(200).json({
      success: true,
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUsersByStatus = async (req, res) => {
  try {
    const { disabled } = req.query;

    let query = db.collection("users");

    if (disabled !== undefined) {
      if (disabled !== "true" && disabled !== "false") {
        return res.status(400).json({
          success: false,
          message: "disabled must be true or false",
        });
      }

      const isDisabled = disabled === "true";

      query = query.where("disabled", "==", isDisabled);
    }

    const snapshot = await query.get();

    const users = [];

    snapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return res.status(200).json({
      success: true,
      totalUsers: users.length,
      users,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const userRef = db.collection("users").doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await userRef.delete();

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection("users").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: doc.id,
        ...doc.data(),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
    updateUserStatus,
    getUsers,
    deleteUser,
    getSingleUser,
    getActiveUsers,
    getInactiveUsers,
    getUsersByStatus
}