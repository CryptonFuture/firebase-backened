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


module.exports = {
    updateUserStatus
}