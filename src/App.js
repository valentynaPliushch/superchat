import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
import SignIn from "./components/SignIn";
import ChatRoom from "./components/ChatRoom";
import { useEffect, useState } from "react";

function App() {
  const auth = getAuth();
  const [user, setUser] = useState();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(true);
      } else {
        setUser(false);
      }
    });
  });

  return (
    <div className="App">
      <header>
        {auth.currentUser && (
          <button onClick={() => auth.signOut()} className="signBtn">
            Sign Out
          </button>
        )}
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
      <ToastContainer />
    </div>
  );
}

export default App;
