import React from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { toast } from "react-toastify";

function SignIn() {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const onSubmit = async () => {
    await signInWithPopup(auth, provider)
      .then((result) => {})
      .catch((error) => {
        toast.error(error.message);
      });
  };

  return (
    <div className="signIn-container">
      {!auth.currentUser && (
        <button onClick={onSubmit} className="signBtn">
          Sign In with Google
        </button>
      )}
    </div>
  );
}

export default SignIn;
