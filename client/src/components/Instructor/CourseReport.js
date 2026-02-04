import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../auth/authContext";
import { authFetch } from "../../services/api";

// function CourseReport({ courseId, onClose }) {
//   const { user } = useContext(AuthContext);
//   const [report, setReport] = useState(null);
//   const [loading, setLoading] = useState(true);
//   // NEW: State to handle filtering between quiz and test
//   const [filterType, setFilterType] = useState("quiz"); 

//   useEffect(() => {
//     const fetchReport = async () => {
//       setLoading(true);
//       try {
//         const res = await authFetch(
//           "http://localhost:5000/api/analytics/instructor-report",
//           {
//             method: "POST",
//             body: JSON.stringify({ courseId, filterType }), 
//           },
//           user
//         );
        
//         // FIX: Extract the internal 'data' object sent by Node
//         // If your backend sends { success: true, data: { overall_average... } }
//         if (res.success) {
//           setReport(res.data); // Save the flattenedData object directly
//         } else {
//           setReport(null);
//         }
//       } catch (err) {
//         console.error("Failed to fetch report", err);
//         setReport(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (courseId && user) fetchReport();
//   }, [courseId, user, filterType]);

//   return (
//     <div className="modal-overlay">
//       <div className="course-modal-box" style={{ maxWidth: "800px" }}>
//         <div className="course-modal-header">
//           <h2>📊 Class Performance Analytics</h2>
//         </div>

//         {/* TABS (Matching your requested style) */}
//         <div className="tab-navigation">
//           <button
//             className={`tab-btn ${filterType === "quiz" ? "active" : ""}`}
//             onClick={() => setFilterType("quiz")}
//           >
//             Daily Quizzes
//           </button>
//           <button
//             className={`tab-btn ${filterType === "test" ? "active" : ""}`}
//             onClick={() => setFilterType("test")}
//           >
//             Weighted Tests
//           </button>
//         </div>

//         {/* CONTENT */}
//         <div className="course-modal-content">
//           {loading ? (
//             <div className="loading-state">Mining {filterType} data...</div>
//           ) : report && report.student_list ? (
//             <div className="instructor-analytics">
              
//               {/* SUMMARY CARDS */}
//               <div className="stats-grid" style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
//                 <div className="stat-card" style={{ flex: 1, padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
//                   <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>Avg {filterType === 'quiz' ? 'Quiz' : 'Test'} Score</h4>
//                   <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{report.overall_average}%</p>
//                 </div>
//                 <div className="stat-card" style={{ flex: 1, padding: '15px', background: '#fff1f0', borderRadius: '8px' }}>
//                   <h4 style={{ margin: '0 0 10px 0', color: '#cf1322' }}>At-Risk ({filterType}s)</h4>
//                   <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#cf1322' }}>{report.at_risk_count}</p>
//                 </div>
//               </div>

//               {/* DATA TABLE */}
//               <h3>⚠️ {filterType === 'quiz' ? 'Quiz' : 'Test'} Performance & Trends</h3>
//               <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
//                 <table className="analytics-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
//                   <thead style={{ position: 'sticky', top: 0, background: '#f4f4f4' }}>
//                     <tr>
//                       <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
//                       <th style={{ padding: '12px', textAlign: 'left' }}>Average</th>
//                       <th style={{ padding: '12px', textAlign: 'left' }}>Trend</th>
//                       <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {report.student_list.map((student) => {
//                       const isCritical = student.priority === 'Critical';
//                       return (
//                         <tr 
//                           key={student.id} 
//                           style={{ 
//                             borderBottom: '1px solid #eee',
//                             backgroundColor: isCritical ? '#fff1f0' : 'transparent' 
//                           }}
//                         >
//                           <td style={{ padding: '12px', fontWeight: isCritical ? 'bold' : 'normal' }}>
//                             {student.name} {isCritical && '⚠️'}
//                           </td>
//                           <td style={{ padding: '12px' }}>{student.score}%</td>
//                           <td style={{ 
//                             padding: '12px', 
//                             fontWeight: 'bold', 
//                             color: student.trend > 0 ? '#52c41a' : student.trend < -10 ? '#ff4d4f' : '#888' 
//                           }}>
//                             {student.trend > 0 ? `📈 +${student.trend}` : student.trend < 0 ? `📉 ${student.trend}` : '--'}
//                           </td>
//                           <td style={{ padding: '12px' }}>
//                             <span className={`badge ${student.priority.toLowerCase()}`} style={{
//                               padding: '4px 8px',
//                               borderRadius: '4px',
//                               fontSize: '11px',
//                               fontWeight: 'bold',
//                               backgroundColor: isCritical ? '#ffccc7' : '#e6f7ff',
//                               color: isCritical ? '#a8071a' : '#0050b3',
//                               border: isCritical ? '1px solid #ffa39e' : '1px solid #91d5ff'
//                             }}>
//                               {student.priority}
//                             </span>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           ) : (
//             <div style={{ textAlign: 'center', padding: '40px' }}>
//               <p>No {filterType} data found for this course.</p>
//             </div>
//           )}
//         </div>

//         <div className="course-modal-footer">
//           <button className="modal-btn" onClick={onClose}>Close Report</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default CourseReport;

function CourseReport({ courseId, onClose }) {
  const { user } = useContext(AuthContext);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // PRIMARY TABS (Quiz vs Test)
  const [filterType, setFilterType] = useState("quiz"); 
  // SECONDARY TABS (Summary vs Breakdown)
  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setReport(null); // CRITICAL: Reset state so .map doesn't run on wrong data type
      
      try {
        // Switch endpoint based on the active tab
        const endpoint = activeTab === "summary" 
          ? "/api/analytics/instructor-report" 
          : "/api/analytics/grouped-report";

        const res = await authFetch(
          `http://localhost:5000${endpoint}`,
          {
            method: "POST",
            body: JSON.stringify({ courseId, filterType }), 
          },
          user
        );
        
        if (res.success) {
          setReport(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch report", err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId && user) fetchReport();
  }, [courseId, user, filterType, activeTab]);

  return (
    <div className="modal-overlay">
      <div className="course-modal-box" style={{ maxWidth: "850px" }}>
        <div className="course-modal-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <h2>📊 Class Analytics</h2>
          </div>
        </div>

        {/* PRIMARY TABS: Filter between Quiz and Test */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${filterType === "quiz" ? "active" : ""}`}
            onClick={() => setFilterType("quiz")}
          >
            Daily Quizzes
          </button>
          <button 
            className={`tab-btn ${filterType === "test" ? "active" : ""}`}
            onClick={() => setFilterType("test")}
          >
            Weighted Tests
          </button>
        </div>

        {/* SECONDARY TABS: Switch between Risk Summary and Detailed Breakdown */}
        <div style={{ display: 'flex', gap: '20px', padding: '10px 20px', borderBottom: '1px solid #eee' }}>
          <span 
            onClick={() => setActiveTab("summary")}
            style={{ 
              cursor: 'pointer', 
              color: activeTab === "summary" ? "#6c5ce7" : "#999", 
              fontWeight: activeTab === "summary" ? "bold" : "normal",
              fontSize: '14px'
            }}
          >
            📋 Risk Summary
          </span>
          <span 
            onClick={() => setActiveTab("breakdown")}
            style={{ 
              cursor: 'pointer', 
              color: activeTab === "breakdown" ? "#6c5ce7" : "#999", 
              fontWeight: activeTab === "breakdown" ? "bold" : "normal",
              fontSize: '14px'
            }}
          >
            🔍 Detailed Breakdown
          </span>
        </div>

        <div className="course-modal-content">
          {loading ? (
            <div className="loading-state" style={{ textAlign: 'center', padding: '40px' }}>
              Mining {filterType} data...
            </div>
          ) : report ? (
            <>
              {/* === VIEW 1: RISK SUMMARY (Object Data) === */}
              {activeTab === "summary" && report.student_list && (
                <div className="instructor-analytics">
                  <div className="stats-grid" style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
                    <div className="stat-card" style={{ flex: 1, padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>Avg {filterType} Score</h4>
                      <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{report.overall_average}%</p>
                    </div>
                    <div className="stat-card" style={{ flex: 1, padding: '15px', background: '#fff1f0', borderRadius: '8px' }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#cf1322' }}>At-Risk Students</h4>
                      <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#cf1322' }}>{report.at_risk_count}</p>
                    </div>
                  </div>

                  <h3>⚠️ Performance & Trends</h3>
                  <div style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
                    <table className="analytics-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ position: 'sticky', top: 0, background: '#f4f4f4' }}>
                        <tr>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Average</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Trend</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.student_list.map((student) => {
                          const isCritical = student.priority === 'Critical';
                          return (
                            <tr key={student.id} style={{ borderBottom: '1px solid #eee', backgroundColor: isCritical ? '#fff1f0' : 'transparent' }}>
                              <td style={{ padding: '12px', fontWeight: isCritical ? 'bold' : 'normal' }}>{student.name} {isCritical && '⚠️'}</td>
                              <td style={{ padding: '12px' }}>{student.score}%</td>
                              <td style={{ padding: '12px', fontWeight: 'bold', color: student.trend > 0 ? '#52c41a' : student.trend < -10 ? '#ff4d4f' : '#888' }}>
                                {student.trend > 0 ? `📈 +${student.trend}` : student.trend < 0 ? `📉 ${student.trend}` : '--'}
                              </td>
                              <td style={{ padding: '12px' }}>
                                <span className={`badge ${student.priority.toLowerCase()}`} style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', backgroundColor: isCritical ? '#ffccc7' : '#e6f7ff', color: isCritical ? '#a8071a' : '#0050b3' }}>
                                  {student.priority}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* === VIEW 2: DETAILED BREAKDOWN (Array Data) === */}
              {activeTab === "breakdown" && Array.isArray(report) && (
                <div className="breakdown-view">
                  {report.map((group, i) => (
                    <div key={i} className="assessment-group" style={{ marginBottom: '30px', border: '1px solid #eee', borderRadius: '8px' }}>
                      <div style={{ padding: '10px 15px', background: '#f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '16px' }}>📑 {group.title}</strong>
                        <span style={{ fontWeight: 'bold', color: '#6c5ce7' }}>Class Avg: {group.avgScore}%</span>
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#fafafa' }}>
                          <tr>
                            <th style={{ padding: '10px 15px', textAlign: 'left', fontSize: '12px', color: '#888' }}>Student Name</th>
                            <th style={{ padding: '10px 15px', textAlign: 'right', fontSize: '12px', color: '#888' }}>Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.students.map((s, si) => (
                            <tr key={si} style={{ borderTop: '1px solid #f1f1f1' }}>
                              <td style={{ padding: '10px 15px' }}>{s.name}</td>
                              <td style={{ padding: '10px 15px', textAlign: 'right', fontWeight: 'bold' }}>{s.score}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>No {filterType} data found for this course.</p>
            </div>
          )}
        </div>

        <div className="course-modal-footer">
          <button className="modal-btn" onClick={onClose}>Close Report</button>
        </div>
      </div>
    </div>
  );
}
export default CourseReport;

