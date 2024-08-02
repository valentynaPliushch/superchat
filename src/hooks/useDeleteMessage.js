import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "../firebase.config";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { doc, deleteDoc } from "firebase/firestore";

const deleteMessage = async ({ imageName, imageURL, message }) => {
  if (imageName && imageURL) {
    const storage = getStorage();
    const imageRef = ref(storage, `images/${imageName}`);
    await deleteObject(imageRef);
  }
  await deleteDoc(doc(db, "messages", message.id));
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => queryClient.invalidateQueries("messages"),
  });
};
