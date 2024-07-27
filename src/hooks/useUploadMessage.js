import { getAuth } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.config";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const createMessage = async (formValue) => {
  const auth = getAuth();
  const { uid, photoURL } = auth.currentUser;
  await addDoc(collection(db, "messages"), {
    createdAt: serverTimestamp(),
    photoURL,
    text: formValue,
    uid,
  });
};

const useUploadMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMessage,
    onSuccess: () => queryClient.invalidateQueries("messages"),
  });
};

export default useUploadMessage;
