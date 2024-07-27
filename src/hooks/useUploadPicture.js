import { v4 } from "uuid";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuth } from "firebase/auth";
import { db } from "../firebase.config";
import {
  ref,
  getDownloadURL,
  uploadBytesResumable,
  getStorage,
} from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { toast } from "react-toastify";

const uploadPicture = async (image) => {
  const storage = getStorage();
  const auth = getAuth();
  const { uid, photoURL } = auth.currentUser;
  if (image === null) {
    return;
  }
  const imageName = v4();
  const imageRef = ref(storage, `images/${imageName}`);

  const uploadTask = uploadBytesResumable(imageRef, image);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {},
      (error) => {
        toast.error("Something went wrong during uploading picture");
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await uploadImageToDatabase(downloadURL);
          resolve(downloadURL);
        } catch (error) {
          reject(error);
        }
      }
    );
  });

  async function uploadImageToDatabase(url) {
    await addDoc(collection(db, "messages"), {
      createdAt: serverTimestamp(),
      photoURL,
      imageURL: url,
      imageName,
      uid,
    });
  }
};

const useUploadPicture = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadPicture,
    onSuccess: () => {
      queryClient.invalidateQueries("messages");
      toast.success("Image was uploaded");
    },
    onError: (error) => {
      toast.error("Upload failed" + error.message);
    },
  });
};

export default useUploadPicture;
