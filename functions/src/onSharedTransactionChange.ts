import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// assumes admin was initialized by caller

// a trigger
export const onSharedTransactionChange = functions.firestore
    .document("shared/{groupId}")
    .onCreate(async (snap) : Promise<void> => {
      console.log("onCreate Triggered");
      console.log("Got new shared transaction group at: "+snap.id);

      const memberMap: {[id: string]: boolean} = snap.data().memberMap;
      try {
        if (!memberMap || Object.keys(memberMap).length == 0 ) {
          console.error(`memberMap does not exist on ${snap.id}`);
          return;
        }

        // add new values to shared field of all participating accounts
        await Promise.all(Object.keys(memberMap).map(async (member) => {
          await admin.firestore().collection("accounts").doc(member).set({
            shared: {
              [snap.id]: memberMap,
            },
          }, {merge: true});
        }));
        return;
      } catch (e) {
        console.error(e);
        return;
      }
    });
