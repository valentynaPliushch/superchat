import React, { useState, useEffect } from "react";
import { v4 } from "uuid";
import { getAuth } from "firebase/auth";
import {
  doc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  listAll,
  getDownloadURL,
} from "firebase/storage";
import { db } from "../firebase.config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import ChatMessage from "./ChatMessage";
import { text } from "@fortawesome/fontawesome-svg-core";

function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [formValue, setFormValue] = useState("");
  const [picture, setPicture] = useState();
  const [edit, setEdit] = useState();
  const [imageURL, setImageURL] = useState();

  const auth = getAuth();

  useEffect(() => {
    const getMessages = async () => {
      const messagesRef = collection(db, "messages");
      const q = query(messagesRef, orderBy("createdAt"), limit(25));

      onSnapshot(q, (querySnapshot) => {
        const messages = [];
        querySnapshot.forEach((doc) => {
          messages.push({
            data: doc.data(),
            id: doc.id,
          });
        });
        setMessages(messages);
      });
    };

    getMessages();
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;
    await addDoc(collection(db, "messages"), {
      createdAt: serverTimestamp(),
      photoURL,
      text: formValue,
      uid,
    });
    setFormValue("");
  };

  const editMessage = (text, id) => {
    setFormValue(text);
    setEdit({
      value: true,
      id,
    });
  };

  const updateMessage = async (e) => {
    e.preventDefault();
    const messageRef = doc(db, "messages", edit.id);

    await updateDoc(messageRef, {
      text: formValue,
    });

    setEdit("");
    setFormValue("");
  };
  const storage = getStorage();

  // const uploadPicture = async () => {
  //   if (picture == null) {
  //     return;
  //   }
  //   const imageRef = ref(storage, `images/${picture.name + v4()}`);
  //   const { uid, photoURL } = auth.currentUser;

  //   await uploadBytes(imageRef, picture).then(() => {
  //     alert("Image uploaded");
  //   });
  //   await getDownloadURL(imageRef).then((item) => {
  //     setImageURL(item);
  //   });

  //   await addDoc(collection(db, "messages"), {
  //     createdAt: serverTimestamp(),
  //     photoURL,
  //     image: `${imageURL}`,
  //     uid,
  //   });
  // };

  return (
    <>
      <main>
        {messages &&
          messages.map((message, index) => (
            <ChatMessage key={index} message={message} onEdit={editMessage} />
          ))}
      </main>
      <form onSubmit={edit.value === "undefined" ? sendMessage : updateMessage}>
        {/* <form onSubmit={sendMessage}> */}
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Type your message..."
        />
        {/* <input type="file" onChange={(e) => setPicture(e.target.files[0])} /> */}

        {/* <button type="button" onClick={uploadPicture}>
          <FontAwesomeIcon icon={faPaperclip} />
        </button> */}

        <button type="submit" disabled={!formValue}>
          🕊️
        </button>
      </form>
    </>
  );
}

export default ChatRoom;
