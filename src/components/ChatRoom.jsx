import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { getAuth } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase.config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import ChatMessage from "./ChatMessage";
import Spinner from "./Spinner";
import { useQuery } from "@tanstack/react-query";
import getMessages from "../hooks/getMessages";
import useUploadPicture from "../hooks/useUploadPicture";
import useUploadMessage from "../hooks/useUploadMessage";

function ChatRoom() {
  const auth = getAuth();
  const textRef = useRef();
  const chatContainerRef = useRef(null);
  const inputFile = useRef();
  const mutationImage = useUploadPicture();
  const mutationMessage = useUploadMessage();

  const [formValue, setFormValue] = useState();
  const [edit, setEdit] = useState({
    value: false,
    id: "",
  });

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  });

  const messagesQuery = useQuery({
    queryKey: ["mesagges"],
    queryFn: getMessages,
  });

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
      mutationMessage.mutate(formValue);
      setFormValue("");
    }
  };

  const handleUploadPicture = () => {
    const file = inputFile.current.files[0];
    if (file) {
      mutationImage.mutate(file);
    } else {
      toast.info("Please select a file");
    }
  };
  const handleSendPicture = () => {
    inputFile.current.click();
  };

  if (messagesQuery.isLoading) {
    return <Spinner />;
  }

  return (
    <>
      <header className="header-btn">
        <button onClick={() => auth.signOut()} className="signBtn">
          Sign Out
        </button>
      </header>
      <main ref={chatContainerRef}>
        {messagesQuery.data.map((message, index) => (
          <ChatMessage key={index} message={message} onEdit={editMessage} />
        ))}
      </main>
      <form onSubmit={(e) => onSubmit(e)} className="form-container">
        <input
          className="form-text-input"
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          ref={textRef}
          placeholder="Type your message..."
        />
        <div>
          <input
            type="file"
            id="file_input"
            max="1"
            accept=".jpg,.png,.jpeg"
            ref={inputFile}
            style={{ display: "none" }}
            onChange={handleUploadPicture}
          />
        </div>
        <button
          className="form-button"
          type="button"
          onClick={handleSendPicture}
        >
          <FontAwesomeIcon icon={faPaperclip} />
        </button>

        <button className="form-button" type="submit" disabled={!formValue}>
          <i class="fa-solid fa-paper-plane" />
        </button>
      </form>
    </>
  );
}

export default ChatRoom;
