// src/App.js
import React from "react";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import LoginPage from "./components/LoginPage";
import HomePage, { NavBar, Footer} from "./components/HomePage";
import RegisterPage from "./components/RegisterPage";

function App() { 
  return( 
   <BrowserRouter>
   <NavBar />
    <Routes>
      <Route
        exact
        path="/LoginPage"
        element={<LoginPage />}
      />

      <Route
        path="/"
        element={<HomePage />}
      />

      <Route
        path="/RegisterPage"
        element={<RegisterPage />} 
       />

      <Route
        path="*"
        element={<Navigate to="/" />}
       />
    </Routes>
    <Footer />
   </BrowserRouter>
  );
}

export default App;
