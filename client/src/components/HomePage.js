import React, { useState, useEffect, useContext, use } from "react";
import "../CSS/HomePage.css";
// import { auth } from "../firebase";
// import { onAuthStateChanged } from "firebase/auth";
import { AuthContext } from "../auth/authContext";
import { authFetch } from "../services/api";
import { signOut } from "firebase/auth";
import { auth,db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

import { Link, useNavigate } from "react-router-dom";

function NavBar() {
  const { user } = useContext(AuthContext);
  const [dropDownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => {
    setDropdownOpen(!dropDownOpen);
  }
  const navigate = useNavigate();
  const handleLogOut = async () => {
    // Perform logout operations here
    await signOut(auth);
    navigate("/LoginPage");
  };
  useEffect(() => {
    if (!user) return;

    const fetchUserDetails = async () => {
      try{
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          user.firstName = data.firstName;
        }
        else {
          console.log("No user data found for UID:", user.uid);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    fetchUserDetails();
  }, [user]);
  return (
    <header className="home-nav">
      <div className="home-nav-left">Learning Platform</div>
      <ul className="home-nav-menu">
        <li>Courses</li>
        <li>About</li>
        <li>Services</li>
        <li>Contact</li>
      </ul>
      <div className="home-nav-right">
        {!user ? (
          <Link to="/LoginPage">
            <button className="home-nav-login-btn">Login / Signup</button>
          </Link>)
          : (
            <div className="dropdown">
              <button className="dropbtn" onClick={toggleDropdown}>
                {user.firstName} ▼
              </button>
              {dropDownOpen && (
              <div className="dropdown-content">
                <button onClick={()=> navigate("/ProfilePage")}>Profile</button>  
                <button onClick={handleLogOut}>Logout</button>
              </div>
              )}
            </div>
          )}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="home-footer">
      <div className="home-footer-left">
        <div className="home-footer-logo">Website</div>
        <p>123 Learning Street, Singapore</p>
      </div>

      <div className="home-footer-columns">
        <div>
          <h4>About</h4>
          <p>Company</p>
          <p>Team</p>
          <p>Careers</p>
        </div>

        <div>
          <h4>Support</h4>
          <p>Help Center</p>
          <p>Contact</p>
          <p>FAQ</p>
        </div>

        <div>
          <h4>Social</h4>
          <p>Facebook</p>
          <p>Instagram</p>
          <p>LinkedIn</p>
        </div>
      </div>
    </footer>
  );
}

function HomePage() {
  // const [user, setUser] = useState(null);
  // const [studentData, setStudentData] = useState(null);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [gamification, setGamification] = useState(null);
  // useEffect(() => {
  //   console.log("Entering Homepage");
  //   const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
  //     setUser(firebaseUser || null);

  //     if (firebaseUser) {
  //       try {
  //         const token = await firebaseUser.getIdToken();

  //         const response = await fetch(
  //           "http://localhost:5000/api/students/profile",
  //           {
  //             method: "GET",
  //             headers: {
  //               "Content-Type": "application/json",
  //               Authorization: `Bearer ${token}`,
  //             },
  //           }
  //         );

  //         const data = await response.json();
  //         setStudentData(data);
  //       } catch (error) {
  //         console.error("Error fetching student data:", error);
  //       }
  //     }
  //   });

  //   return () => unsubscribe();
  // }, []);

  useEffect(() => {
    if (!user) return;


    (async () => {
    try {
    const result = await authFetch("http://localhost:5000/api/auth/current-user", {}, user);
    if (result.success) {
    setProfile(result.data.profile);
    setGamification(result.data.gamification);
    }
    } catch (err) {
    console.error(err);
    }
    })();
    }, [user]);


    if (!user) return <div>Please login</div>;


  return (
    <div className="home-page">
      <main className="home-hero">
        <section className="home-hero-left">
          <h1>Welcome to HomePage</h1>
          <p>
            This is the learning platform where students can log in to access
            personalised content and features.
          </p>

          {user && (
            <div className="home-welcome-box">
              <button className="profilePage"><Link to="/ProfilePage">Go to Profile</Link></button>
              <p className="home-logged-in-text">
              You are currently logged in as <strong>{profile?.name ?? user.email}</strong>.
            </p>
            <pre>{JSON.stringify({ profile, gamification}, null, 2)}</pre>
            </div>
          )}

          {/* {loading && <p>Loading your profile...</p>}
          {error && <p style={{ color: "red" }}>⚠️ Error: {error}</p>} */}

          {/* DISPLAY BACKEND DATA */}
          {/* {studentData && studentData.gamification && (
            <div className="home-progress-box">
              <h3>🎓 Your Progress</h3>
              <p>
                <strong>Points:</strong> {studentData.gamification.points}
              </p>
              <p>
                <strong>Level:</strong> {studentData.gamification.level}
              </p>
              <p>
                <strong>Current Streak:</strong>{" "}
                {studentData.gamification.streak} days
              </p>
              <p>
                <strong>Badges:</strong>{" "}
                {studentData.gamification.badges.length > 0
                  ? studentData.gamification.badges.join(", ")
                  : "No badges yet - keep learning!"}
              </p>
            </div>
          )} */}
        </section>
      </main>
    </div>
  );
}

export default HomePage;
export { NavBar, Footer };
