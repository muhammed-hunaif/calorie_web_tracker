import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useSearchParams } from 'react-router-dom';
import {
  Activity,
  Calendar,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Flame,
} from 'lucide-react';

const ExerciseEntry = () => {
  const [exerciseData, setExerciseData] = useState([]);
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const limit = 10;

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  const formatDate = (dateObj) => {
    const d = String(dateObj.getDate()).padStart(2, '0');
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const y = dateObj.getFullYear();
    return `${d}-${m}-${y}`;
  };

  // Form state
  const [date] = useState(formatDate(new Date()));
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [duration, setDuration] = useState('');
  const [unit, setUnit] = useState('');

  // State for editing
  const [editEntryId, setEditEntryId] = useState(null);
  const [editDuration, setEditDuration] = useState('');

  const fetchData = async () => {
    try {
      const [exerciseRes, entriesRes] = await Promise.all([
        api.get('/exercisemaster', { params: { all: 'true' } }),
        api.get('/exerciseentry', { params: { page: currentPage, limit } }),
      ]);
      setExerciseData(exerciseRes.data.data);
      setEntries(entriesRes.data.data);
      setTotal(entriesRes.data.total);
      setTotalPages(entriesRes.data.totalPages);

      if (entriesRes.data.totalPages > 0 && currentPage > entriesRes.data.totalPages) {
        setSearchParams({ page: entriesRes.data.totalPages });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const selectedExercise = exerciseData.find((e) => e.id === parseInt(selectedExerciseId));
  const caloriesBurnedPerUnit = selectedExercise ? selectedExercise.calories_burned : 0;
  const totalCaloriesBurned = selectedExercise && duration ? caloriesBurnedPerUnit * duration : 0;

  const handleSave = async () => {
    if (!selectedExerciseId) {
      alert('Please select an exercise');
      return;
    }
    if (!duration || isNaN(duration) || duration <= 0) {
      alert('Please enter a valid quantity / duration');
      return;
    }

    try {
      await api.post('/exerciseentry/add', {
        exerciseId: Number(selectedExerciseId),
        duration: Number(duration),
      });
      alert('Entry saved successfully!');
      setSelectedExerciseId('');
      setDuration('');
      setUnit('');
      fetchData();
    } catch (error) {
      console.error('Error saving entry:', error);
      alert(error.response?.data?.message || 'Failed to save entry');
    }
  };

  const handleCancelForm = () => {
    setSelectedExerciseId('');
    setDuration('');
    setUnit('');
  };

  const handleEdit = (entry) => {
    setEditEntryId(entry.id);
    setEditDuration(entry.duration);
  };

  const handleCancelEdit = () => {
    setEditEntryId(null);
    setEditDuration('');
  };

  const handleUpdate = async (entryId) => {
    if (!editDuration || isNaN(editDuration) || editDuration <= 0) {
      alert('Please enter a valid quantity / duration');
      return;
    }

    try {
      await api.put(`/exerciseentry/update/${entryId}`, {
        duration: Number(editDuration),
      });
      alert('Entry updated successfully!');
      setEditEntryId(null);
      fetchData();
    } catch (error) {
      console.error('Error updating entry:', error);
      alert(error.response?.data?.message || 'Failed to update entry');
    }
  };

  const handleDelete = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    try {
      await api.delete(`/exerciseentry/delete/${entryId}`);
      fetchData();
      alert('Entry deleted successfully!');
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Exercise Entry</h1>
        <p className="text-sm text-slate-500 mt-1">
          Log workouts and physical activities to calculate calories burned.
        </p>
      </div>

      {/* Log Form Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs max-w-xl">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Log Exercise Activity</span>
          </h2>
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/80">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{date}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Select Exercise
            </label>
            <select
              value={selectedExerciseId}
              onChange={(e) => {
                const newId = e.target.value;
                setSelectedExerciseId(newId);
                const exercise = exerciseData.find((ex) => ex.id === parseInt(newId));
                setUnit(exercise ? exercise.unit || '' : '');
              }}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            >
              <option value="">Choose an exercise...</option>
              {exerciseData.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.exercise_name} ({exercise.calories_burned} kcal / {exercise.unit})
                </option>
              ))}
            </select>
          </div>

          {selectedExerciseId && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Quantity / Duration
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 30"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition capitalize"
                  >
                    <option value="">Select Unit</option>
                    <option value="min">min</option>
                    <option value="rep">rep</option>
                    <option value="km">km</option>
                  </select>
                </div>
              </div>

              {/* Total Burned Preview */}
              <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-700 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-emerald-600" />
                  Calculated Burn:
                </span>
                <span className="text-base font-bold text-emerald-900">
                  {Math.round(totalCaloriesBurned)}{' '}
                  <span className="text-xs font-normal text-emerald-600">kcal</span>
                </span>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs transition cursor-pointer"
                >
                  Save Entry
                </button>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logged Entries Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Today&apos;s Workout Logs</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Exercise</th>
                <th className="py-3 px-4">Duration / Reps</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4">Calories Burned</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.length > 0 ? (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {entry.image_url ? (
                          <img
                            src={`${entry.image_url}?tr=w-40,h-40,fo-auto`}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                            <Activity className="w-4 h-4" />
                          </div>
                        )}
                        <span className="text-sm font-semibold text-slate-900">
                          {entry.exercise_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-700">
                      {editEntryId === entry.id ? (
                        <input
                          type="number"
                          min="0"
                          value={editDuration}
                          onChange={(e) => setEditDuration(e.target.value)}
                          className="w-24 px-2 py-1 rounded border border-indigo-500 text-sm"
                        />
                      ) : (
                        <span className="font-medium">{entry.duration}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                        {entry.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-emerald-600">
                      {Math.round(entry.duration * entry.calories_burned)}{' '}
                      <span className="text-xs text-slate-400 font-normal">kcal</span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      {editEntryId === entry.id ? (
                        <>
                          <button
                            onClick={() => handleUpdate(entry.id)}
                            title="Confirm"
                            className="inline-flex p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            title="Cancel"
                            className="inline-flex p-1.5 rounded-md text-slate-400 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(entry)}
                            title="Edit"
                            className="inline-flex p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            title="Delete"
                            className="inline-flex p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-sm text-slate-400">
                    No workout entries recorded yet today.
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
              <strong className="text-slate-700">{totalPages || 1}</strong> ({total} total)
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

export default ExerciseEntry;
