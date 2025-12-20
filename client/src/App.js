// src/App.js
import React from "react";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./CSS/App.css";
import { AuthProvider } from "./auth/authContext";
import LoginPage from "./components/LoginPage";
import HomePage, { NavBar, Footer } from "./components/HomePage";
import RegisterPage from "./components/RegisterPage";
import ProfilePage from "./components/ProfilePage";
import CourseEditorPage from "./components/Instructor/CourseEditorPage";

import CoursePage from "./components/Student/CoursePage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="page-layout">
          <NavBar />
          <div className="content-wrap">
            <Routes>
              <Route exact path="/LoginPage" element={<LoginPage />} />

              <Route path="/" element={<HomePage />} />

              <Route path="/RegisterPage" element={<RegisterPage />} />

              <Route path="/ProfilePage" element={<ProfilePage />} />

              <Route path="/CourseEditorPage" element={<CourseEditorPage />} />

              <Route path="/CoursePage" element={<CoursePage />} />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
