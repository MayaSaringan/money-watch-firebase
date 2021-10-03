import {UserRecord} from "firebase-functions/v1/auth";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";


const serviceAccount = require(
    "../key/config.json"
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


const getUserByEmail = (email: string) => {
  return new Promise((res, rej) => {
    admin.auth().getUserByEmail(email)
        .then((userRecord : UserRecord ) => {
          console.log(userRecord);
          res({
            name: userRecord.displayName,
            email: userRecord.email,
            photo: userRecord.photoURL,
          });
        })
        .catch(rej);
  });
};

exports.users = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "GET") {
    try {
      const email : string = req.query.email as string;
      const result = await getUserByEmail(email);
      res.json(result);
    } catch (e) {
      //console.log(e.errorInfo);
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
