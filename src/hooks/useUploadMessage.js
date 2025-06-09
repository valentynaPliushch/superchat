import { getAuth } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.config";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const createMessage = async (formValue) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.error("❌ No user is logged in!");
    return;
  }
  const { uid, photoURL } = user;

  const docRef = await addDoc(collection(db, "messages"), {
    createdAt: serverTimestamp(),
    photoURL,
    text: formValue,
    uid,
  });
  return docRef;
};

const useUploadMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMessage,
    onSuccess: (data) => {
      queryClient.invalidateQueries("messages");
    },
  });
};

export default useUploadMessage;
