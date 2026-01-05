import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../auth/authContext";
import { authFetch } from "../services/api";
import "../CSS/CourseEditorPage.css"; // Reusing grid styles

function InternshipPostingPage(){
    const { user } = useContext(AuthContext);
    const [postings, setPostings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedPosting, setSelectedPosting] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchPostings = async () => {
        try {
            const res = null;
          //const res = await authFetch("http://localhost:5000/api/students/courses", {}, user);
          if (res.success) {
            setPostings(res.data);
          }
        } catch (error) {
          console.error("Error fetching courses:", error);
        } finally {
          setLoading(false);
        }
      };
    
    useEffect(() => {
        if (user) fetchPostings();
    }, [user]);

    // Safely get the user ID, or use an empty string if user is null
    const userId = user?.uid || "";

    // Sorting: Enrolled courses first
    /*const sortedPosting = [...postings].sort((a, b) => {
        const isEnrolledA = a.enrolledStudents?.includes(user.uid);
        const isEnrolledB = b.enrolledStudents?.includes(user.uid);
        return isEnrolledB - isEnrolledA; // True (1) comes before False (0)
    });*/

    const openPostingDetails = (posting) => {
        setSelectedPosting(posting);
        setIsModalOpen(true);
    };

    return (
    <div style={{ padding: "20px" }}>
      <h1>Available Internships</h1>
      <p>Available internships currently on offer. Meet the requirements and be shortlisted for the final selection.</p>

      <div className="courses-grid">
        {
        /*sortedPosting.map((posting) => {
          //const meetRequirements = course.enrolledStudents?.includes(user.uid);
          return (
            <div
              key={course.id}
              className="course-card"
              onClick={() => openPostingDetails(course)}
              style={{
                border: isEnrolled ? "2px solid #4cd137" : "1px solid #ddd",
              }}
            >
              <div
                className="course-card-image"
                style={{
                  backgroundImage: `url('https://placehold.co/600x400?text=${course.title.charAt(
                    0
                  )}')`,
                }}
              ></div>
              <div className="course-card-content">
                {isEnrolled && (
                  <span
                    style={{
                      backgroundColor: "#4cd137",
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    ENROLLED
                  </span>
                )}
                <h3>{course.title}</h3>
                <p style={{ fontSize: "14px", color: "#666" }}>
                  Instructor: {course.instructorName}
                </p>
              </div>
            </div>
          );
        })*/}
        </div>
    </div>
    );
}

export default InternshipPostingPage;