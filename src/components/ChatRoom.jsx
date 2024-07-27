import React, { useState, useEffect, useRef } from "react";
import { v4 } from "uuid";
import { toast } from "react-toastify";
import { getAuth } from "firebase/auth";
import {
  doc,
  updateDoc,
  collection,
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import getMessages from "../hooks/getMessages";
import useUploadPicture from "../hooks/useUploadPicture";
import useUploadMessage from "../hooks/useUploadMessage";

function ChatRoom() {
  const textRef = useRef();

  const [formValue, setFormValue] = useState();
  const [edit, setEdit] = useState({
    value: false,
    id: "",
  });

  const messagesQuery = useQuery({
    queryKey: ["mesagges"],
    queryFn: getMessages,
  });
  const queryClient = useQueryClient();

  const editMessage = (text, id) => {
    setFormValue(text);
    setEdit({
      value: true,
      id,
    });
  };
  const mutationMessage = useUploadMessage();
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

  const inputFile = useRef();
  const handleReset = () => {
    if (inputFile.current) {
      inputFile.current.value = "";
      inputFile.current.type = "text";
      inputFile.current.type = "file";
    }
  };
  const mutationImage = useUploadPicture();

  const handleUploadPicture = () => {
    const file = inputFile.current.files[0];
    if (file) {
      mutationImage.mutate(file);
    } else {
      toast.info("Please select a file");
    }
  };

  if (messagesQuery.isLoading) {
    return <Spinner />;
  }

  return (
    <>
      <main>
        {messagesQuery.data.map((message, index) => (
          <ChatMessage key={index} message={message} onEdit={editMessage} />
        ))}
      </main>
      <form onSubmit={(e) => onSubmit(e)}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          ref={textRef}
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
        <button type="button" onClick={handleUploadPicture}>
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
