import React, { useState, useEffect, useRef } from "react";
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
import { faPaperclip, faXmark } from "@fortawesome/free-solid-svg-icons";
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
  const [imageURL, setImageURL] = useState({
    url: "",
    name: "",
  });

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
    const imageName = v4();
    const imageRef = ref(storage, `images/${imageName}`);
    const { uid, photoURL } = auth.currentUser;

    await uploadBytes(imageRef, picture).then(() => {
      alert("Image uploaded");
    });

    await getDownloadURL(imageRef).then((item) => {
      setImageURL({ url: item, name: imageName });
    });

    await addDoc(collection(db, "messages"), {
      createdAt: serverTimestamp(),
      photoURL,
      imageURL: imageURL.url,
      imageName,
      uid,
    });
  };
  console.log(imageURL);

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

  const inputFile = useRef(null);
  const handleReset = () => {
    if (inputFile.current) {
      inputFile.current.value = "";
      inputFile.current.type = "text";
      inputFile.current.type = "file";
    }
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((message, index) => (
            <ChatMessage key={index} message={message} onEdit={editMessage} />
          ))}
        <input
          type="file"
          ref={inputFile}
          onChange={(e) => setPicture(e.target.files[0])}
        />
        <button type="button" onClick={handleReset}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </main>
      <form onSubmit={(e) => onSubmit(e)}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Type your message..."
          disabled={picture}
        />

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
