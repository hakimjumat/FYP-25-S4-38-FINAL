import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../auth/authContext";
import { authFetch } from "../../services/api";

import "../../CSS/CourseEditorPage.css"; // Reusing grid styles
import "../../CSS/CoursePage.css";

import qrcode from "../../images/placeholderQRCode.png"

function RewardStorePage() {
    const { user } = useContext(AuthContext); // get logged in use information
    const [profile, setProfile] = useState(null);
    const [gamification, setGamification] = useState(null);
    const [rewardID, setRewardID] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false); // controls popup visibility
    const [loading, setLoading] = useState(true);
    const [cfmMsg, setcfmMsg] = useState(false);
    const [rewardDisplay, setrewardDisplay] = useState(false);
    const [urBrokelol, setBrokeness] = useState(null);

    //very stupid point increment
    const [ten, setshite] = useState({points:10});

    const redeemReward = async () => {
        setrewardDisplay(true);
        if(rewardID === "5NTUC")
        {
            try{
                await authFetch("http://localhost:5000/api/students/changecurrency", {method: "POST", body:JSON.stringify({points:-50})}, user)
            }catch (error){
                console.error("Change currency error:", error);
            }
            try{
                await authFetch("http://localhost:5000/api/students/updateTransactionHistory", {method: "POST", body: JSON.stringify({rewardID: rewardID})}, user)
            }catch(error){
                console.error("Update Transaction History error:", error);
            }finally{
                setLoading(true);
                forceReloadData();
            }
        }
        else if(rewardID === "10NTUC")
        {
            try{
                await authFetch("http://localhost:5000/api/students/changecurrency", {method: "POST", body:JSON.stringify({points:-100})}, user)
            }catch (error){
                console.error("Change currency error:", error);
            }
            try{
                await authFetch("http://localhost:5000/api/students/updateTransactionHistory", {method: "POST", body: JSON.stringify({rewardID: rewardID})}, user)
            }catch(error){
                console.error("Update Transaction History error:", error);
            }finally{
                setLoading(true);
                forceReloadData();
            }
        }
        else if (rewardID === "1YOffice365")
        {
            try{
                await authFetch("http://localhost:5000/api/students/changecurrency", {method: "POST", body:JSON.stringify(ten)}, user)
            }catch (error){
                console.error("Change currency error:", error);
            }
            try{
                await authFetch("http://localhost:5000/api/students/updateTransactionHistory", {method: "POST", body: JSON.stringify({rewardID: rewardID})}, user)
            }catch(error){
                console.error("Update Transaction History error:", error);
            }finally{
                setLoading(true);
                forceReloadData();
            }
        }
        setcfmMsg(false);
    }

    const openRewardDetails = (rewardtag) => {
        setRewardID(rewardtag);
        setIsModalOpen(true);
    }

    const debugaddpoints = async () => {
        console.log(ten);
        await authFetch("http://localhost:5000/api/students/changecurrency", {method: "POST", body:JSON.stringify(ten)}, user)
        setLoading(true);
        forceReloadData();
    }

    function displayCfmMessage(){
        let x = 0;
        if(rewardID === "5NTUC")
            x = 50;
        if(rewardID === "10NTUC")
            x=100;
        if(rewardID==="1YOffice365")
            x=500;
        
        if(checkvalue(x) === false){
            setcfmMsg(true);
        }
        else{
            console.log("Insufficeint Currency");
        }
        
    }

    const closeCfmMessage = () => {
        setcfmMsg(false);
    }

    const closeModal = () => {
        setBrokeness(false);
        setIsModalOpen(false);
    }

    function checkvalue(price) {
        setBrokeness(false);
        console.log("Checking against account currency...");
        console.log("Account Balance: " + gamification.currency + "Prize Cost: " + price);
        if(gamification.currency < price){
            setBrokeness(true);
            return true;
        }
        else{
            setBrokeness(false);
            return false;
        }
    }

    const closeReward = () => {
        setrewardDisplay(false);
        setIsModalOpen(false);
    }

    const forceReloadData = async () => {
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
            console.error("Account gamification load error:", error);
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
                                        {urBrokelol === true && (
                                            <div className="no-monies-alert">
                                                You have insufficient currency!
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="course-modal-footer">
                                        <button className="modal-btn" onClick={displayCfmMessage}>
                                            Redeem Reward (50)
                                        </button>
                                        <button className="text-btn" onClick={closeModal}>
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
                                        {urBrokelol === true && (
                                            <div className="no-monies-alert">
                                                You have insufficient currency!
                                            </div>
                                        )}
                                    </div>
                                    <div className="course-modal-footer">
                                        <button className="modal-btn" onClick={displayCfmMessage}>
                                            Redeem Reward (100)
                                        </button>
                                        <button className="text-btn" onClick={closeModal}>
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
                                        {urBrokelol === true && (
                                            <div className="no-monies-alert">
                                                You have insufficient currency!
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="course-modal-footer">
                                        <button className="modal-btn" onClick={displayCfmMessage}>
                                            Redeem Reward (500)
                                        </button>
                                        <button className="text-btn" onClick={closeModal}>
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )
                        }
                </div>
            ) : (null)}
            {    
                cfmMsg === true && (
                    <div className="modal-overlay">
                        <div className="course-modal-box">
                                <div className="course-modal-header"> 
                                    <div className="course-desc">
                                        To proceede please click 'Confirm'
                                    </div>
                                </div>
                            <div className="course-modal-footer">
                                <button className="modal-btn" onClick={redeemReward}>
                                    Confirm
                                </button>
                                <button className="modal-btn" onClick={closeCfmMessage}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )
                        
            }
            {
                rewardDisplay === true && (
                    <div className="modal-overlay">
                        <div className="course-modal-box">
                                <div className="course-modal-header">
                                    <div className="course-title-row">
                                            Your Prize
                                    </div>
                                    {
                                        rewardID === "10NTUC" && (
                                            <img src = {qrcode} alt = "qrcode"/>
                                        )
                                    }
                                    {
                                        rewardID === "5NTUC" && (
                                            <img src = {qrcode} alt = "qrcode"/>
                                        )
                                    }
                                </div>
                            <div className="course-modal-footer">
                                <button className="modal-btn" onClick={closeReward}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}

export default RewardStorePage;