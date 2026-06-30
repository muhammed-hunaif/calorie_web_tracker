import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/Report.css';

const Report = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromDate = searchParams.get('fromDate') || '';
  const queryToDate = searchParams.get('toDate') || '';
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const limit = 10;

  const [fromDate, setFromDate] = useState(queryFromDate);
  const [toDate, setToDate] = useState(queryToDate);
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();

  const fetchReports = async (start, end) => {
    try {
      const params = {};
      if (start && end) {
        params.fromDate = start;
        params.toDate = end;
      }
      const response = await api.get('/reports', { params });
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      alert('Failed to fetch reports.');
    }
  };

  useEffect(() => {
    setFromDate(queryFromDate);
    setToDate(queryToDate);
    fetchReports(queryFromDate, queryToDate);
  }, [queryFromDate, queryToDate]);

  const handleSearch = () => {
    if ((fromDate && !toDate) || (!fromDate && toDate)) {
      alert('Please select both From Date and To Date, or leave both empty to see all records.');
      return;
    }
    const params = { page: 1 };
    if (fromDate && toDate) {
      params.fromDate = fromDate;
      params.toDate = toDate;
    }
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = { page: newPage };
    if (queryFromDate && queryToDate) {
      params.fromDate = queryFromDate;
      params.toDate = queryToDate;
    }
    setSearchParams(params);
  };

  const totalPages = Math.ceil(reports.length / limit);
  const startIndex = (currentPage - 1) * limit;
  const paginatedReports = reports.slice(startIndex, startIndex + limit);

  const handleViewDetails = (date) => {
    navigate(`/ReportView/${date}?fromDate=${queryFromDate}&toDate=${queryToDate}&page=${currentPage}`);
  };

  return (
    <div className="report-container">
      <h1>Reports</h1>

      <div className="report-filter-container">
        <div className="form-group">
          <label className="form-label">From Date:</label>
          <input
            type="date"
            className="form-input"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">To Date:</label>
          <input
            type="date"
            className="form-input"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <button className="search-btn" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>

      <div className="report-table-container">
        <table className="report-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Consumed</th>
              <th>Burned</th>
              <th>Net</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReports.length > 0 ? (
              paginatedReports.map((report) => (
                <tr key={report.date}>
                  <td>{report.date}</td>
                  <td>{report.consumed}</td>
                  <td>{report.burned}</td>
                  <td>{report.net}</td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => handleViewDetails(report.date)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                  No data available 
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {reports.length > 0 && (
        <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '10px' }}>
          <button 
            disabled={currentPage === 1} 
            onClick={() => handlePageChange(currentPage - 1)}
            style={{ padding: '8px 16px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >
            Previous
          </button>
          <span style={{ padding: '8px' }}>Page {currentPage} of {totalPages || 1}</span>
          <button 
            disabled={currentPage === totalPages || totalPages === 0} 
            onClick={() => handlePageChange(currentPage + 1)}
            style={{ padding: '8px 16px', cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer' }}
          >
            Next
          </button>
        </div>
      )}

    </div>
  );
};

export default Report;
