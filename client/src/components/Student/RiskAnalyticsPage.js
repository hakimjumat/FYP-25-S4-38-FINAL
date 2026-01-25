import React, { useContext, useEffect, useState } from 'react';
import { authFetch } from "../../services/api";
import { AuthContext } from "../../auth/authContext";
import { useParams } from 'react-router-dom';


function RiskPredictor({ studentId, courseId, assessmentId }) {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchAnalysis = async () => {
            setLoading(true);
            try {
                // Pointing to your Node.js Backend (Port 5000)
                const response = await authFetch('http://localhost:5000/api/analytics/risk', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        studentId, // Add this!
                        courseId, 
                        assessmentId 
                    })

                }, user);

                if (!response.ok) {
                    throw new Error('Failed to fetch risk data');
                }

                const result = await response.json();
                if (result.success) {
                    setAnalysis(result.data);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (studentId && courseId) {
            fetchAnalysis();
        }
    }, [user, studentId,courseId, assessmentId]);

    if (loading) return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <div className="spinner"></div> {/* You can add CSS for this */}
            <p>Analyzing performance patterns with AI...</p>
        </div>
    );

    if (error) return <div style={{ color: 'red', padding: '10px' }}>Error: {error}</div>;

    if (!analysis) return null;

    const colors = {
        High: '#ff4d4f',   // Red
        Medium: '#faad14', // Orange/Yellow
        Low: '#52c41a',    // Green
        Inconclusive: '#bfbfbf' // Grey
    };

    const statusColor = colors[analysis.riskLevel] || '#bfbfbf';

    return (
        <div style={{
            border: `2px solid ${statusColor}`,
            borderRadius: '12px',
            padding: '20px',
            backgroundColor: '#fff',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            maxWidth: '400px'
        }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>AI Risk Assessment</h3>
            
            <div style={{ 
                display: 'inline-block',
                padding: '5px 15px',
                borderRadius: '20px',
                backgroundColor: statusColor,
                color: '#fff',
                fontWeight: 'bold',
                marginBottom: '15px'
            }}>
                {analysis.riskLevel} Risk
            </div>

            <div style={{ fontSize: '0.9rem', color: '#666' }}>
                <p><strong>Average Score:</strong> {analysis.scoreAvg}%</p>
                
                <p>
                    <strong>Trend:</strong> {analysis.trendValue > 0 ? '📈 Improving' : '📉 Declining'} 
                    ({analysis.trendValue > 0 ? '+' : ''}{analysis.trendValue} pts)
                </p>
                
                <hr style={{ border: '0', borderTop: '1px solid #eee' }} />
                
                <p style={{ fontStyle: 'italic', color: '#444' }}>
                    "{analysis.recommendation}"
                </p>
            </div>
        </div>
    );
};

function RiskAnalyticsPage() {
   const { courseId, assessmentId } = useParams();
    const { user } = useContext(AuthContext);

    // If user isn't loaded yet, don't try to render
    if (!user) return <div>Loading user session...</div>;

    return (
        <div>
            <h1>Analysis</h1>
            <RiskPredictor 
                courseId={courseId} 
                assessmentId={assessmentId} 
                studentId={user.uid} // This is the ID used to build docId: progress_ID_CourseID
            />
        </div>
    );
};

export default RiskAnalyticsPage;
export { RiskPredictor };
