import React, { useContext, useEffect, useState } from 'react';
import { authFetch } from "../../services/api";
import { AuthContext } from "../../auth/authContext";
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';


function RiskPredictor({ studentId, courseId, assessmentId, type }) {
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
                        studentId, 
                        courseId, 
                        assessmentId,
                        type: type
                    })

                }, user);
                if (response.success) {
                    setAnalysis(response.data);
                    setError(null);
                } else {
                    setError(response.message);
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
    }, [user, studentId, courseId, assessmentId]);

    if (loading) return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <div className="spinner" style={{ 
                border: '4px solid #f3f3f3', 
                borderTop: '4px solid #6c5ce7', 
                borderRadius: '50%', 
                width: '30px', 
                height: '30px', 
                animation: 'spin 1s linear infinite',
                margin: '0 auto 10px'
            }}></div>
            <p>Analyzing performance patterns...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (error) return <div style={{ color: 'red', padding: '20px' }}>{error}</div>;

    if (!analysis && !loading) {
        return (
            <div style={{ padding: '20px', color: '#666' }}>
                <p>No assessment attempts found yet.</p>
                <p style={{ fontSize: '0.8rem' }}>Complete this quiz to generate an AI risk analysis.</p>
            </div>
        );
    }

    const colors = {
        High: '#ff4d4f',   // Red
        Medium: '#faad14', // Orange/Yellow
        Low: '#52c41a',    // Green
        Inconclusive: '#bfbfbf' // Grey
    };

    const statusColor = colors[analysis.riskLevel] || '#bfbfbf';

    const chartData = (analysis.history || []).map((score, index) => ({
        attempt: `Attempt ${index + 1}`,
        score: score
    }));

    return (
        <div style={{
            borderRadius: '12px',
            padding: '10px',
            backgroundColor: '#fff',
            width: '100%',
            maxWidth: '400px'
        }}>
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                <div style={{ 
                    display: 'inline-block',
                    padding: '5px 20px',
                    borderRadius: '20px',
                    backgroundColor: statusColor,
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                }}>
                    {analysis.riskLevel} Risk
                </div>
            </div>

            {/* PERFORMANCE GRAPH - Hidden for weighted tests */}
            {type !== "test" && type !== "weighted" ? (
                <div style={{ width: '100%', height: 180, marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#888' }}>SCORE HISTORY</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="attempt" hide />
                            <YAxis domain={[0, 100]} width={25} style={{ fontSize: '10px' }} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="score" 
                                stroke={statusColor} 
                                strokeWidth={3} 
                                dot={{ r: 4, fill: statusColor }} 
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div style={{ padding: '10px 0', textAlign: 'center', color: '#888', fontSize: '0.85rem' }}>
                    <p>Performance summary for weighted assessment</p>
                </div>
            )}

            <div style={{ fontSize: '0.9rem', color: '#444', borderTop: '1px solid #f0f0f0', paddingTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span><strong>Score:</strong></span>
                    <span>{analysis.scoreAvg}%</span>
                </div>
                
                {/* Only show Trend if there is more than 1 attempt and it's not a weighted test */}
                {analysis.history?.length > 1 && type !== "test" && type !== "weighted" && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <span><strong>Recent Trend:</strong></span>
                        <span style={{ color: analysis.trendValue >= 0 ? '#52c41a' : '#ff4d4f' }}>
                            {analysis.trendValue >= 0 ? '📈 +' : '📉 '}{analysis.trendValue} pts
                        </span>
                    </div>
                )}
                
                <div style={{ 
                    backgroundColor: '#f9f9f9', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    fontStyle: 'italic',
                    fontSize: '0.85rem',
                    color: '#555',
                    lineHeight: '1.4'
                }}>
                    "{analysis.recommendation}"
                </div>
            </div>
        </div>
    );
};

export default RiskPredictor;