const { getAuth } = require("firebase-admin/auth")
const { getFirestore } = require("firebase-admin/firestore")
const { app } = require("../config/firebase");
const axios = require("axios");

const db = getFirestore(app)

const signup = async (req, res) => {

    try {

        const { username, email, password } = req.body;

        const user = await getAuth(app).createUser({
            username,
            email,
            password
        });

        await db.collection("users").doc(user.uid).set({
            uid: user.uid,
            username: username,
            email: user.email,
            displayName: user.displayName || "",
            emailVerified: user.emailVerified,
            active: user.disabled,
            createdAt: new Date(),
        })

        res.status(201).json({
            success: true,
            user,
            username,
            message: "User created successfully",
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

const login = async (req, res) => {

     const { uid } = req.body;

    try {

        const decoded = await getAuth(app).createCustomToken(uid);

        res.json({
            success: true,
            user: decoded
        });

    }

    catch (err) {

        res.status(401).json({
            success: false,
            message: err.message
        });

    }

}

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    const uid = response.data.localId;

    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User data not found.",
      });
    }

    const userData = userDoc.data();

    if (userData.active === false) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact the administrator for approval.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: response.data.idToken,
      refreshToken: response.data.refreshToken,
      expiresIn: response.data.expiresIn,
      user: {
        uid: response.data.localId,
        email: response.data.email,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message:
        error.response?.data?.error?.message || error.message,
    });
  }
};

const forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;

        const link = await getAuth(app).generatePasswordResetLink(email);

        res.json({
            success: true,
            resetLink: link
        });

    }

    catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

    

}

const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    const decoded = await getAuth(app).verifyIdToken(token);

    res.json({
      success: true,
      user: decoded,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};

module.exports = {
    signup,
    login,
    forgotPassword,
    verifyToken,
    signin
}