import React, { useState, useEffect, useRef } from "react";
import { v4 } from "uuid";
import { toast } from "react-toastify";
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
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import { db } from "../firebase.config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip, faXmark } from "@fortawesome/free-solid-svg-icons";
import ChatMessage from "./ChatMessage";
import Spinner from "./Spinner";

function ChatRoom() {
  const [loading, isLoading] = useState(false);
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

    isLoading(true);

    const uploadTask = uploadBytesResumable(imageRef, picture);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;
        }
      },
      (error) => {
        toast.error("Something went wrong during uploading picture");
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          uploadImageToDatabase(downloadURL);
        });
      }
    );

    const uploadImageToDatabase = async (url) => {
      await addDoc(collection(db, "messages"), {
        createdAt: serverTimestamp(),
        photoURL,
        imageURL: url,
        imageName,
        uid,
      });

      isLoading(false);
    };
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

  const inputFile = useRef(null);
  const handleReset = () => {
    if (inputFile.current) {
      inputFile.current.value = "";
      inputFile.current.type = "text";
      inputFile.current.type = "file";
      setPicture({});
    }
  };

  return (
    <>
      <main>
        {loading && <Spinner />}
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
        <div className="file_input_div">
          <label htmlFor="file_input" className="btn_file_input">
            Select picture
          </label>

          <input
            type="file"
            id="file_input"
            max="1"
            accept=".jpg,.png,.jpeg"
            ref={inputFile}
            onChange={(e) => setPicture(e.target.files[0])}
            style={{ display: "none" }}
          />
          <button
            className="clear_file_input"
            type="button"
            onClick={handleReset}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <button type="button" onClick={picture && uploadPicture}>
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
