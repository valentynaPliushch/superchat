import React from "react";
import { getAuth } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { useDeleteMessage } from "../hooks/useDeleteMessage";

function ChatMessage({ message, onEdit }) {
  const auth = getAuth();
  const deleteMsg = useDeleteMessage();
  const { text, imageURL, imageName, uid, photoURL } = message.data;
  if (!photoURL) {
    photoURL = "public/avatar-159236_1280.png";
  }

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  const deleteMessage = () => {
    if (window.confirm("Are you sure you want to delete?")) {
      deleteMsg.mutate({ imageURL, imageName, message });
    }
  };

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img src={`${photoURL}`} className="profile-img" />
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
