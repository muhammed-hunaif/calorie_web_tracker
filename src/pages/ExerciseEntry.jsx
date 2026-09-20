import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useSearchParams } from 'react-router-dom';
import '../styles/ExerciseEntry.css';

const ExerciseEntry = () => {
    const [exerciseData, setExerciseData] = useState([]);
    const [entries, setEntries] = useState([]);
    // Pagination is done by the API now; these come from the response envelope.
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get('page')) || 1;
    const limit = 10;

    const handlePageChange = (newPage) => {
        const params = { page: newPage };
        setSearchParams(params);
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
                // The dropdown needs every exercise, not just the first page.
                api.get('/exercisemaster', { params: { all: 'true' } }),
                api.get('/exerciseentry', { params: { page: currentPage, limit } })
            ]);
            setExerciseData(exerciseRes.data.data);
            setEntries(entriesRes.data.data);
            setTotal(entriesRes.data.total);
            setTotalPages(entriesRes.data.totalPages);

            // Deleting the last row of the last page can leave us past the end.
            if (entriesRes.data.totalPages > 0 && currentPage > entriesRes.data.totalPages) {
                setSearchParams({ page: entriesRes.data.totalPages });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
        // Refetch whenever the page changes - the server returns that page.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    const selectedExercise = exerciseData.find(e => e.id === parseInt(selectedExerciseId));

    const caloriesBurnedPerUnit = selectedExercise ? selectedExercise.calories_burned : 0;
    const totalCaloriesBurned = selectedExercise && duration ? caloriesBurnedPerUnit * duration : 0;

    const handleSave = async () => {
        if (!selectedExerciseId) {
            alert('Please select an exercise');
            return;
        }
        if (!duration || isNaN(duration) || duration <= 0) {
            alert('Please enter a valid duration');
            return;
        }

        try {
            // The <select> and <input> hold strings; the API validates real
            // numbers, so convert before sending.
            await api.post('/exerciseentry/add', {
                exerciseId: Number(selectedExerciseId),
                duration: Number(duration)
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

    // Start editing an entry
    const handleEdit = (entry) => {
        setEditEntryId(entry.id);
        setEditDuration(entry.duration);
    };

    // Cancel edit
    const handleCancelEdit = () => {
        setEditEntryId(null);
        setEditDuration('');
    };

    // Update an entry
    const handleUpdate = async (entryId) => {
        if (!editDuration || isNaN(editDuration) || editDuration <= 0) {
            alert('Please enter a valid duration');
            return;
        }

        try {
            await api.put(`/exerciseentry/update/${entryId}`, {
                duration: Number(editDuration)
            });
            alert('Entry updated successfully!');
            setEditEntryId(null);
            fetchData();
        } catch (error) {
            console.error('Error updating entry:', error);
            alert(error.response?.data?.message || 'Failed to update entry');
        }
    };

    // Delete an entry
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
        <div className="exercise-entry-container">
            <h1>Exercise Entry</h1>

            <div className="form-container">
                <div className="form-group">
                    <label>Exercise</label>
                    <select
                        value={selectedExerciseId}
                        onChange={(e) => {
                            const newId = e.target.value;
                            setSelectedExerciseId(newId);
                            const exercise = exerciseData.find(ex => ex.id === parseInt(newId));
                            if (exercise) {
                                setUnit(exercise.unit || '');
                            } else {
                                setUnit('');
                            }
                        }}
                    >
                        <option value="">Select Exercise</option>
                        {exerciseData.map(exercise => (
                            <option key={exercise.id} value={exercise.id}>
                                {exercise.exercise_name}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedExerciseId && (
                    <>
                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="text"
                                value={date}
                                readOnly
                                className="readonly-input font-bold"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group half">
                                <label>
                                    Quantity</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    placeholder="e.g. 30"
                                />
                            </div>
                            <div className="form-group half">
                                <label>Unit</label>
                                <select
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value)}
                                    className="form-input capitalize"
                                >
                                    <option value="">Select Unit</option>
                                    <option value="rep">rep</option>
                                    <option value="km">km</option>
                                    <option value="min">min</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Calories Burned Per Unit</label>
                            <input
                                type="text"
                                value={caloriesBurnedPerUnit}
                                readOnly
                                className="readonly-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Total Calories Burned</label>
                            <input
                                type="text"
                                value={totalCaloriesBurned}
                                readOnly
                                className="readonly-input font-bold"
                            />
                        </div>

                        <div className="button-group">
                            <button className="save-btn" onClick={handleSave}>Save</button>
                            <button className="cancel-btn" onClick={handleCancelForm}>Cancel</button>
                        </div>
                    </>
                )}
            </div>

            <div className="saved-entries-section">
                <h2>Saved Entries</h2>
                {entries.length > 0 ? (
                    <table className="exercise-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Exercise Name</th>
                                <th>Calories</th>
                                <th>Unit</th>
                                <th>Quantity</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry) => (
                                <tr key={entry.id}>
                                    <td>{new Date(entry.created_at).toLocaleDateString()}</td>
                                    <td className="name-cell">
                                        {entry.image_url && (
                                            <img
                                                src={`${entry.image_url}?tr=w-40,h-40,fo-auto`}
                                                alt=""
                                                className="row-thumb"
                                                loading="lazy"
                                            />
                                        )}
                                        {entry.exercise_name}
                                    </td>
                                    <td>{entry.calories_burned}</td>
                                    <td className="capitalize">{entry.unit}</td>
                                    <td>
                                        {editEntryId === entry.id ? (
                                            <input
                                                type="number"
                                                min="0"
                                                value={editDuration}
                                                onChange={(e) => setEditDuration(e.target.value)}
                                                className="quantity-input"
                                            />
                                        ) : (
                                            entry.duration
                                        )}
                                    </td>
                                    <td>
                                        {editEntryId === entry.id ? (
                                            <>
                                                <button className="btn-update" onClick={() => handleUpdate(entry.id)}>Update</button>
                                                <button className="btn-cancel" onClick={handleCancelEdit}>Cancel</button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="btn-edit" onClick={() => handleEdit(entry)}>Edit</button>
                                                <button className="btn-delete" onClick={() => handleDelete(entry.id)}>Delete</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="no-data">No entries saved yet.</p>
                )}

                {total > 0 && (
                    <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '10px' }}>
                        <button
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                            style={{ padding: '8px 16px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                        >
                            Previous
                        </button>
                        <span style={{ padding: '8px' }}>Page {currentPage} of {totalPages || 1} ({total} total)</span>
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
        </div>
    );
};

export default ExerciseEntry;