const { getAuth } = require("firebase-admin/auth")
const { getFirestore } = require("firebase-admin/firestore")
const { app } = require("../config/firebase");
const axios = require("axios");
const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

const db = getFirestore(app)

const signup = async (req, res) => {

    try {

      const { username, email, password } = req.body;

      let imageUrl = "";
      let localImage = "";

      if (req.file) {
        localImage = `/uploads/${req.file.filename}`;

        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "users",
        });

        imageUrl = result.secure_url;

        // Agar local file delete karni ho upload ke baad:
        // fs.unlinkSync(req.file.path);
      }

        const user = await getAuth(app).createUser({
            username,
            email,
            password,
            photoURL: imageUrl || ""
        });

        await db.collection("users").doc(user.uid).set({
            uid: user.uid,
            username: username,
            email: user.email,
            displayName: user.displayName || "",
            image: imageUrl || "",
            localImage,
            emailVerified: user.emailVerified,
            disabled: user.disabled,
            createdAt: new Date(),
        })

        res.status(201).json({
            success: true,
            user,
            username,
            image: imageUrl,
            localImage,
            message: "User created successfully",
        });

    } catch (err) {

      
        console.log("Error in signup:", err);
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

    if (userData.disabled === false) {
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
        username: userData.username,
        disabled: userData.disabled,
        emailVerified: userData.emailVerified,
        createdAt: userData.createdAt

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

const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is required",
      });
    }

    const decodedToken = await getAuth(app).verifyIdToken(token);

    await getAuth(app).revokeRefreshTokens(decodedToken.uid);

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

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

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// const googleLogin = async (req, res) => {

//     try {

//         const { idToken } = req.body;

//         if (!idToken) {
//             return res.status(400).json({
//                 success: false,
//                 message: "ID Token is required"
//             });
//         }

//         const decodedToken = await getAuth().verifyIdToken(idToken);

//         const {
//             uid,
//             email,
//             name,
//             picture
//         } = decodedToken;

//         const userRef = db.collection("users").doc(uid);

//         const doc = await userRef.get();

//         if (!doc.exists) {

//             await userRef.set({
//                 uid,
//                 username: name || "",
//                 email,
//                 image: picture || "",
//                 provider: "google",
//                 emailVerified: true,
//                 createdAt: new Date()
//             });

//         }

//         const user = (await userRef.get()).data();

//         res.status(200).json({
//             success: true,
//             message: "Google Login Successful",
//             user
//         });

//     } catch (err) {

//         res.status(401).json({
//             success: false,
//             message: err.message
//         });

//     }

// };

const anonymousLogin = async (req, res) => {
    try {

        const apiKey = process.env.FIREBASE_API_KEY;

        const response = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
            {
                returnSecureToken: true
            }
        );

        const { 
            localId,
            idToken,
            refreshToken
        } = response.data;

        const userRef = db.collection("users").doc(localId);

        const doc = await userRef.get();

        console.log('DOC', doc);
        

        if (!doc.exists) {
            const newUserData = {
                uid: localId,
                username: "Anonymous User",
                provider: "anonymous",
                isAnonymous: true,
                disabled: true,
                createdAt: new Date()
            };

            await userRef.set(newUserData);

        }

        res.status(200).json({
            success: true,
            message: "Anonymous Login Successful",
            uid: localId,
            idToken,
            refreshToken
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.response?.data || err.message
        });
    }
};



module.exports = {
    signup,
    login,
    forgotPassword,
    verifyToken,
    signin,
    logout,
    signout,
    anonymousLogin,
    // googleLogin
}