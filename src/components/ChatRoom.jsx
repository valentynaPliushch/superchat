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
  const [formValue, setFormValue] = useState();
  const [picture, setPicture] = useState();
  const [edit, setEdit] = useState({
    value: false,
    id: "",
  });
  const [imageURL, setImageURL] = useState();

  const auth = getAuth();
  const storage = getStorage();

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

  const uploadPicture = async () => {
    if (picture == null) {
      return;
    }
    const imageRef = ref(storage, `images/${v4()}`);
    const { uid, photoURL } = auth.currentUser;

    await uploadBytes(imageRef, picture).then(() => {
      alert("Image uploaded");
    });

    const newRef = ref(storage, `images/`);
    await listAll(newRef).then((res) => {
      getDownloadURL(res.items[0]).then((url) => console.log(url));
    });
    await getDownloadURL(imageRef).then((item) => {
      setImageURL(item);
      // console.log(item);
    });

    await addDoc(collection(db, "messages"), {
      createdAt: serverTimestamp(),
      photoURL,
      image: `${imageURL}`,
      uid,
    });
  };

  const editMessage = (text, id) => {
    setFormValue(text);
    setEdit({
      value: true,
      id,
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (edit.value) {
      const messageRef = doc(db, "messages", edit.id);

      await updateDoc(messageRef, {
        text: formValue,
      });

      setEdit("");
      setFormValue("");
    } else {
      const { uid, photoURL } = auth.currentUser;
      await addDoc(collection(db, "messages"), {
        createdAt: serverTimestamp(),
        photoURL,
        text: formValue,
        uid,
      });
      setFormValue("");
    }
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((message, index) => (
            <ChatMessage key={index} message={message} onEdit={editMessage} />
          ))}
      </main>
      <form onSubmit={(e) => onSubmit(e)}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Type your message..."
        />
        <input type="file" onChange={(e) => setPicture(e.target.files[0])} />
        <button
          type="button"
          onClick={() => console.log(picture.name.split(".")[0])}
        ></button>

        <button type="button" onClick={uploadPicture}>
          <FontAwesomeIcon icon={faPaperclip} />
        </button>

        <button type="submit" disabled={!formValue}>
          🕊️
        </button>
      </form>
    </>
  );
}

export default ChatRoom;
