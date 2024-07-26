import React from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

function SignIn() {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const onSubmit = async () => {
    await signInWithPopup(auth, provider)
      .then((result) => {
        // const user = result.user;
        // const user = result.user;
      })
      .catch((error) => {
        // // const errorCode = error.code;
        // const errorMessage = error.message;
        // // const email = error.customData.email;
        // // const credential = GoogleAuthProvider.credentialFromError(error);
      });
  };

  return (
    <>
      {!auth.currentUser && (
        <button onClick={onSubmit} className="signBtn">
          Sign In with Google
        </button>
      )}
    </>
  );
}

export default SignIn;
