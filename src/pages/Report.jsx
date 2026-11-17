import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  Search,
  RotateCcw,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
} from 'lucide-react';

const Report = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromDate = searchParams.get('fromDate') || '';
  const queryToDate = searchParams.get('toDate') || '';
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const limit = 10;

  const [fromDate, setFromDate] = useState(queryFromDate);
  const [toDate, setToDate] = useState(queryToDate);
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  const fetchReports = async (start, end, page) => {
    try {
      const params = { page, limit };
      if (start && end) {
        params.fromDate = start;
        params.toDate = end;
      }
      const response = await api.get('/reports', { params });
      setReports(response.data.data);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching reports:', error);
      alert(error.response?.data?.message || 'Failed to fetch reports.');
    }
  };

  useEffect(() => {
    setFromDate(queryFromDate);
    setToDate(queryToDate);
    fetchReports(queryFromDate, queryToDate, currentPage);
  }, [queryFromDate, queryToDate, currentPage]);

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

  const handleReset = () => {
    setFromDate('');
    setToDate('');
    setSearchParams({ page: 1 });
  };

  const handlePageChange = (newPage) => {
    const params = { page: newPage };
    if (queryFromDate && queryToDate) {
      params.fromDate = queryFromDate;
      params.toDate = queryToDate;
    }
    setSearchParams(params);
  };

  const handleViewDetails = (date) => {
    navigate(
      `/ReportView/${date}?fromDate=${queryFromDate}&toDate=${queryToDate}&page=${currentPage}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Activity Reports</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review daily calorie intake, workout burns, and net balances across history.
        </p>
      </div>

      {/* Date Filter Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3.5">
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSearch}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs transition cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Filter</span>
            </button>

            {(fromDate || toDate) && (
              <button
                onClick={handleReset}
                title="Reset Filters"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Calories Consumed</th>
                <th className="py-3 px-4">Calories Burned</th>
                <th className="py-3 px-4">Net Balance</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.length > 0 ? (
                reports.map((report) => {
                  const netValue = Number(report.net);
                  const isSurplus = netValue > 0;
                  return (
                    <tr key={report.date} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-900">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{report.date}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-amber-600">
                        {report.consumed} <span className="text-xs text-slate-400 font-normal">kcal</span>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-emerald-600">
                        {report.burned} <span className="text-xs text-slate-400 font-normal">kcal</span>
                      </td>
                      <td className="py-3 px-4 text-sm font-bold">
                        <span className={isSurplus ? 'text-indigo-600' : 'text-slate-700'}>
                          {report.net}{' '}
                          <span className="text-xs text-slate-400 font-normal">kcal</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleViewDetails(report.date)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/60 text-slate-600 hover:text-indigo-700 text-xs font-medium transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Breakdown</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-sm text-slate-400">
                    <FileText className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    No activity records found for this date range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
            <span className="text-center sm:text-left">
              Showing Page <strong className="text-slate-700">{currentPage}</strong> of{' '}
              <strong className="text-slate-700">{totalPages || 1}</strong> ({total} recorded days)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => handlePageChange(currentPage + 1)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Report;
