const { getAuth } = require("firebase-admin/auth")
const { getFirestore } = require("firebase-admin/firestore")
const { app } = require("../config/firebase");
const axios = require("axios");
const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const redis = require("../config/redis");

const db = getFirestore(app)

const signup = async (req, res) => {

  try {

    const { username, email, password, role } = req.body;

    let imageUrls = [];
    let localImages = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        localImages.push(`/uploads/${file.filename}`);

        const result = await cloudinary.uploader.upload(file.path, {
          folder: "users",
        });

        imageUrls.push(result.secure_url);

        // Agar local file delete karni ho upload ke baad:
        // fs.unlinkSync(req.file.path);
      }

    }
    const user = await getAuth(app).createUser({
      email,
      password,
      displayName: username,
      photoURL: imageUrls.length > 0 ? imageUrls[0] : undefined,
    });

    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "",
      image: imageUrls,
      role,
      is_admin: role === "admin" ? 1 : 0,
      localImages,
      emailVerified: user.emailVerified,
      active: user.disabled,
      createdAt: new Date(),
    };

    // Save in Firestore
    await db.collection("users").doc(user.uid).set(userData);

    await redis.set(
      `user:${user.uid}`,
      JSON.stringify(userData),
      {
        EX: 3600,
      }
    );

    return res.status(201).json({
      success: true,
      user,
      username,
      role,
      is_admin: userData.is_admin,
      image: imageUrls,
      localImages,
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

    return res.json({
      success: true,
      user: decoded
    });

  }

  catch (err) {

    return res.status(401).json({
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

    if (!userData.role) {
      return res.status(403).json({
        success: false,
        message: "Role is not assigned. Please contact the administrator.",
      });
    }

    // Check is_admin
    if (userData.is_admin !== 0 && userData.is_admin !== 1) {
      return res.status(403).json({
        success: false,
        message: "Invalid admin status. Please contact the administrator.",
      });
    }
    
    return res.status(200).json({
      success: true,
      message:
        userData.role === "admin" && userData.is_admin === 1
          ? "Admin login successful."
          : "User login successful.",
      token: response.data.idToken,
      refreshToken: response.data.refreshToken,
      expiresIn: response.data.expiresIn,
     
      user: {
        uid: response.data.localId,
        email: response.data.email,
        role: userData.role,
        is_admin: userData.is_admin,
        displayName: userData.displayName
      },
      
    });
  } catch (error) {
    return res.status(401).json({
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

    return res.json({
      success: true,
      resetLink: link
    });

  }

  catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message
    });

  }
}

const signout = async (req, res) => {
  try {
    const { uid } = req.query

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: "UID is required",
      });
    }

    await getAuth().revokeRefreshTokens(uid);

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    const decoded = await getAuth(app).verifyIdToken(token);

    return res.json({
      success: true,
      user: decoded,
    });
  } catch (error) {
    return res.status(401).json({
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
  signin,
  signout
}