import {UserRecord} from "firebase-functions/v1/auth";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// assumes admin was initialized by caller

// a rest api

interface User {
  name: string,
  photo: string,
  uid: string,
  email?: string,
}

const parseUserRecord = (userRecord: UserRecord): User => {
  if (userRecord.providerData?.length > 0) {
    const providerData = userRecord.providerData[0] as admin.auth.UserInfo;
    const {displayName, photoURL, email} = providerData;
    if (displayName && photoURL && userRecord.uid) {
      return {
        name: displayName,
        photo: photoURL,
        uid: userRecord.uid,
        email,
      };
    }
  }

  return {name: "", photo: "", uid: ""};
};

const getUserByEmail = (target: string): Promise<User> => {
  return admin.auth().getUserByEmail(target)
      .then( parseUserRecord );
};


const getUserByUid = (target: string): Promise<User> => {
  return admin.auth().getUser(target)
      .then( parseUserRecord );
};

// http endpoint
export const users = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "GET") {
    try {
      const email : string | undefined = req.query.email as string | undefined;
      const uid : string | undefined = req.query.uid as string | undefined;
      let result = {};
      if (email) {
        result = await getUserByEmail(email);
      } else if (uid) {
        result = await getUserByUid(uid);
      }
      res.json(result);
    } catch (e) {
      // console.log(e.errorInfo);
      switch (e.errorInfo.code) {
        case "auth/invalid-email": {
          res.status(400).send({error: "Invalid Email"});
          return;
        }
        case "auth/user-not-found": {
          res.status(404).send({error: "Resource Not Found"});
          return;
        }
        default: {
          res.status(500).send({error: "Internal Error"});
        }
      }
    }
  } else {
    res.send("Hello World!");
  }
});

