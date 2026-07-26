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

      const { username, email, password } = req.body;

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

        await db.collection("users").doc(user.uid).set({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || "",
            image: imageUrls || "",
            localImages,
            emailVerified: user.emailVerified,
            active: user.disabled,
            createdAt: new Date(),
        })

        

        res.status(201).json({
            success: true,
            user,
            username,
            image: imageUrls,
            localImages,
            message: "User created successfully",
        });

      await redis.set("users", JSON.stringify(user), {
        EX: 60
      });

      return res.json({
        success: true,
        source: "MongoDB",
        data: user
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