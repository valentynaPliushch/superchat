import React from "react";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase.config";
import { getAuth } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

function ChatMessage({ message, onEdit }) {
  const auth = getAuth();
  const { text, imageURL, imageName, uid, photoURL } = message.data;

  // ref.current.scrollIntoView({ behavior: "smooth" });
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  const deleteMessage = async () => {
    if (window.confirm("Are you sure you want to delete?")) {
      if (imageName && imageURL) {
        const storage = getStorage();
        const imageRef = ref(storage, `images/${imageName}`);
        await deleteObject(imageRef);
        await deleteDoc(doc(db, "messages", message.id));
      } else {
        await deleteDoc(doc(db, "messages", message.id));
      }
    }
  };

  return (
    <>
      <div className={`message ${messageClass}`}>
        {photoURL && <img src={`${photoURL}`} />}
        {imageURL ? (
          <img src={imageURL} className="message_image" />
        ) : (
          <p>{text}</p>
        )}

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
