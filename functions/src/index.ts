import * as admin from "firebase-admin";
import {users} from "./users";
import {onSharedTransactionChange} from "./onSharedTransactionChange";

const serviceAccount = require(
    "../key/config.json"
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// http endpoints
exports.users = users;

// triggers
exports.onSharedTransactionChange = onSharedTransactionChange;
