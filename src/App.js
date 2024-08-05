import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
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
      <div className="section">{user ? <ChatRoom /> : <SignIn />}</div>
      <ToastContainer />
    </div>
  );
}

export default App;
