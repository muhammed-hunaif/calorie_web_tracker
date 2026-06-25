import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/Report.css';

const ReportView = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const fromDate = searchParams.get('fromDate') || '';
  const toDate = searchParams.get('toDate') || '';
  const page = searchParams.get('page') || 1;

  const [detailedData, setDetailedData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/reports/${date}`);
        setDetailedData(response.data);
      } catch (error) {
        console.error('Error fetching detailed report:', error);
        alert('Failed to fetch daily details.');
      } finally {
        setLoading(false);
      }
    };
    if (date) fetchDetails();
  }, [date]);

  const handleBack = () => {
    navigate(`/Report?fromDate=${fromDate}&toDate=${toDate}&page=${page}`);
  };

  return (
    <div className="report-container">
      {loading ? (
        <p>Loading...</p>
      ) : detailedData ? (
        <div className="details-section" style={{ marginTop: '0' }}>
          <div className="details-header">
            <h3>Date : {date}</h3>
            <button className="cancel-btn" onClick={handleBack}>
              Back
            </button>
          </div>
          
          <div className="details-grid">
            <div className="details-col">
              <h4>Food Entries</h4>
              <div className="details-table-wrapper">
                {detailedData.foods && detailedData.foods.length > 0 ? (
                  <table className="details-sub-table">
                    <tbody>
                      {detailedData.foods.map((food) => (
                        <tr key={food.id}>
                          <td className="item-name">{food.food_name}</td>
                          <td className="item-qty">{food.quantity} pieces</td>
                          <td className="item-cals">{food.total_calories}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-data-msg">No food recorded.</p>
                )}
              </div>
            </div>

            <div className="details-col">
              <h4>Exercise Entries</h4>
              <div className="details-table-wrapper">
                {detailedData.exercises && detailedData.exercises.length > 0 ? (
                  <table className="details-sub-table">
                    <tbody>
                      {detailedData.exercises.map((exercise) => (
                        <tr key={exercise.id}>
                          <td className="item-name">{exercise.exercise_name}</td>
                          <td className="item-qty">{exercise.duration} min</td>
                          <td className="item-cals">{exercise.total_burned}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-data-msg">No exercises recorded.</p>
                )}
              </div>
            </div>   
          </div>
        </div>
      ) : (
        <p>No details found.</p>
      )}
    </div>
  );
};

export default ReportView;
