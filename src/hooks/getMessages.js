import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase.config";

const getMessages = async () => {
  const messagesRef = collection(db, "messages");
  const q = query(messagesRef, orderBy("createdAt"), limit(25));

  return new Promise((resolve, reject) => {
    onSnapshot(
      q,
      (querySnapshot) => {
        const messages = [];
        querySnapshot.forEach((doc) => {
          messages.push({
            data: doc.data(),
            id: doc.id,
          });
        });
        resolve(messages);
      },
      (error) => {
        reject(error);
      }
    );
  });
};

export default getMessages;
