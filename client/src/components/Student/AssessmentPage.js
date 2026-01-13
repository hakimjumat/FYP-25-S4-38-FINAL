import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../auth/authContext";
import { authFetch } from "../../services/api";

function AssessmentPage () {
    const { assessmentId } = useParams(); // Get courseId from URL
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [loading, setLoading] = useState(true);
    const [startassessment, setStart] = useState(false);
    const [questionList, setQuestions] = useState([]);
    const [wholeAssignment, setWholeAssignment] = useState(null);

    const goBackToCourse = () => {
        navigate("/CourseEditorPage");
    };
    const getQuestions = async () => {
        try {
            console.log(JSON.stringify(assessmentId));
            const res = await authFetch("http://localhost:5000/api/students/getcourseassessment",
                {method: "GET"}, user);
            if(res.success){

                for(let i = 0; i < res.data.length; i++){
                    console.log(res.data[i].id);
                    if(res.data[i].id === assessmentId)
                    {
                        setWholeAssignment(res.data[i]);
                        setQuestions(res.data[i].questions);
                        console.log("Successfully load assignmnet data")
                    }
                }
            }
        }
        catch (error){
            console.error("Error fetching courses:", error);
        }
        finally{
            setLoading(false);
        }
    }
    useEffect(() => {
        //fetch assessment from DB
        
        getQuestions();
      }, [user]);

    if (loading) return <div>Loading assessment...</div>;

      return(
        <div>
            {
                startassessment === false && (
                    //Assessment splashpage
                    <div>
                        <button onClick={goBackToCourse}>← Back to Courses</button>
                        <h3>{wholeAssignment.title}</h3>
                        <button onClick={setStart(true)}>Start Assessment</button>
                    </div>
            )
            }
            {
                startassessment === true && (
                    <div>
                        <h3>{wholeAssignment.title}</h3>
                    </div>
                )
            }
        </div>
      )
}

export default AssessmentPage;