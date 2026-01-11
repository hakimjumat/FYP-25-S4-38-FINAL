import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../auth/authContext";
import { authFetch } from "../../services/api";

import "../../CSS/CourseEditorPage.css"; // Reusing grid styles
import "../../CSS/CoursePage.css";

function RewardStorePage() {
    const { user } = useContext(AuthContext); // get logged in use information
    const [profile, setProfile] = useState(null);
    const [gamification, setGamification] = useState(null);
    const [rewardID, setRewardID] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false); // controls popup visibility
    const [loading, setLoading] = useState(true);

    //very stupid point increment
    const [ten, setshite] = useState({points:10});

    const openRewardDetails = (rewardtag) => {
        setRewardID(rewardtag);
        setIsModalOpen(true);
    }

    const debugaddpoints = async () => {
        console.log(ten);
        //await authFetch("http://localhost:5000/api/students/points", {method: "POST", body:JSON.stringify(ten)}, user)
        await authFetch("http://localhost:5000/api/students/changecurrency", {method: "POST", body:JSON.stringify(ten)}, user)
        //setLoading(true);
        //loadData();
    }

    useEffect(() => {
        if (!user) return;
    
        const loadData = async () => {
          try {
            // 1. Fetch User Identity & Role first
            // Note: Your authController.getCurrentUser returns data directly in result.data
            const identityRes = await authFetch(
              "http://localhost:5000/api/auth/current-user",
              { method: "GET" },
              user
            );
    
            if (identityRes.success) {
              const userProfile = identityRes.data;
              setProfile(userProfile);
    
              // 2. If Student, execute login logic to record daily login
    
              if (userProfile.role === "student") {
    
                // 3.fetch full Gamification Data
                // We use the student specific route for this
                const studentRes = await authFetch(
                  "http://localhost:5000/api/students/profile",
                  { method: "GET" },
                  user
                );
    
                if (studentRes.success) {
                  // api/students/profile returns nested data: { profile, gamification }
                  const backendGamification = studentRes.data.gamification;
    
                  setGamification(backendGamification);
                }
              }
            }
          } catch (error) {
            console.error("Home page load error:", error);
          } finally {
            setLoading(false);
          }
        };
    
        loadData();
      }, [user]);

      if (loading) return <div>Loading...</div>;

    return(
        <div className="course-page">
            <h1>Rewards Store</h1>
            <p>Redeem your points for prizes</p>
            <p>
                Your Balance: {gamification.currency}
            </p>
            <button onClick = {debugaddpoints}>
                Debug: Add Currency
            </button>
            <div className="courses-grid">
                <div
                    className="course-card"
                    onClick={() => openRewardDetails("5NTUC")}
                >
                    <div
                        className="course-card-image"
                        style={{
                        backgroundImage: `url('https://placehold.co/600x400')`,
                        }}
                    ></div>
                    <div className="course-card-content">
                        <h3>$5 FairPrice Voucher</h3>
                    </div>
                </div>


                <div
                    className="course-card"
                    onClick={() => openRewardDetails("10NTUC")}
                >
                    <div
                        className="course-card-image"
                        style={{
                        backgroundImage: `url('https://placehold.co/600x400')`,
                        }}
                    ></div>
                    <div className="course-card-content">
                        <h3>$10 FairPrice Voucher</h3>
                    </div>
                </div>

                <div
                    className="course-card"
                    onClick={() => openRewardDetails("1YOffice365")}
                >
                    <div
                        className="course-card-image"
                        style={{
                        backgroundImage: `url('https://placehold.co/600x400')`,
                        }}
                    ></div>
                    <div className="course-card-content">
                        <h3>1 Year Microsoft Office Subscription</h3>
                    </div>
                </div>
            </div>

            {isModalOpen ? (
                <div className="modal-overlay">
                        {rewardID === "5NTUC" && (
                                <div className="course-modal-box">
                                    <div className="course-modal-header"> 
                                        <div className="course-title-row">
                                            $5 FairPrice Voucher
                                        </div>
                                        <div className="course-desc">
                                            $5 NTUC FairPrice Voucher redeemable at FiarPrice Supermarkets
                                        </div>
                                    </div>
                                    
                                    <div className="course-modal-footer">
                                        <button className="modal-btn" /*onClick={handleEnroll}*/>
                                            Redeem Reward
                                        </button>
                                        <button className="text-btn" onClick={() => setIsModalOpen(false)}>
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )
                        }
                        {rewardID === "10NTUC" && (
                                <div className="course-modal-box">
                                    <div className="course-modal-header"> 
                                        <div className="course-title-row">
                                            $10 FairPrice Voucher
                                        </div>
                                        <div className="course-desc">
                                            $10 NTUC FairPrice Voucher redeemable at FiarPrice Supermarkets
                                        </div>
                                    </div>
                                    <div className="course-modal-footer">
                                        <button className="modal-btn" /*onClick={handleEnroll}*/>
                                            Redeem Reward
                                        </button>
                                        <button className="text-btn" onClick={() => setIsModalOpen(false)}>
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )
                        }
                        {rewardID === "1YOffice365" && (
                                <div className="course-modal-box">
                                    <div className="course-modal-header"> 
                                        <div className="course-title-row">
                                            1 Year Microsoft Office Subscription
                                        </div>
                                        <div className="course-desc">
                                            1 year subscription to microsoft office.
                                        </div>
                                    </div>
                                    
                                    <div className="course-modal-footer">
                                        <button className="modal-btn" /*onClick={handleEnroll}*/>
                                            Redeem Reward
                                        </button>
                                        <button className="text-btn" onClick={() => setIsModalOpen(false)}>
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )
                        }
                </div>
                
            ) : (null)}
        </div>
    );
}

export default RewardStorePage;