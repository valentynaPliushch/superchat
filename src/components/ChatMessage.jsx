import React, { useRef } from "react";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase.config";
import { getAuth } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

function ChatMessage({ message, onEdit }) {
  const auth = getAuth();
  const ref = useRef();
  const { text, image, uid, photoURL } = message.data;
  // ref.current.scrollIntoView({ behavior: "smooth" });
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  const deleteMessage = async () => {
    if (window.confirm("Are you sure you want to delete?")) {
      await deleteDoc(doc(db, "messages", message.id));
    }
  };

  return (
    <>
      <div ref={ref} className={`message ${messageClass}`}>
        <img src={photoURL} />
        {image ? <img src={image} className="message_image" /> : <p>{text}</p>}

        {messageClass === "sent" && (
          <div className="message_icons">
            {text && (
              <button
                className="message_button"
                onClick={() => onEdit(text, message.id)}
              >
                <FontAwesomeIcon icon={faPenToSquare} />
              </button>
            )}
            <button className="message_button" onClick={deleteMessage}>
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default ChatMessage;
