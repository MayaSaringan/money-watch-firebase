import {UserRecord} from "firebase-functions/v1/auth";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";


const serviceAccount = require(
    "../key/config.json"
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

interface User {
  name: string,
  photo: string,
  uid: string,
}

const parseUserRecord = (userRecord: UserRecord): User => {
  console.log(userRecord);
  const {displayName, photoURL, uid} = userRecord;
  if (displayName && photoURL && uid) {
    return {
      name: displayName,
      photo: photoURL,
      uid: uid,
    };
  }
  return {name: "", photo: "", uid: ""};
};
const getUserByEmail = (target: string): Promise<User> => {
  return new Promise((res, rej) => {
    admin.auth().getUserByEmail(target)
        .then((userRecord : UserRecord ) => {
          res(parseUserRecord(userRecord));
        })
        .catch(rej);
  });
};


const getUserByUid = (target: string): Promise<User> => {
  return new Promise((res, rej) => {
    // console.log(`getUserByUid target: ${target}`)
    admin.auth().getUser(target)
        .then((userRecord : UserRecord ) => {
          res(parseUserRecord(userRecord));
        })
        .catch(rej);
  });
};
exports.users = functions.https.onRequest(async (req, res) => {
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
