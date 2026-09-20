import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useSearchParams } from 'react-router-dom';
import '../styles/FoodEntry.css';

const FoodEntry = () => {
    const [foodData, setFoodData] = useState([]);
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
        // with padstart=05-06-2026
        // without padstart=5-6-2026
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const y = dateObj.getFullYear();
        return `${d}-${m}-${y}`;
    };

    // The unit a quantity is counted in follows from the food's state on the
    // master record - it is never a separate choice at entry time.
    const unitFor = (foodState) => {
        switch (String(foodState || '').toLowerCase()) {
            case 'solid': return 'g';
            case 'liquid': return 'ml';
            case 'piece': return 'pc';
            default: return '';
        }
    };

    // Form state
    const [date] = useState(formatDate(new Date()));
    const [selectedFoodId, setSelectedFoodId] = useState('');
    const [quantity, setQuantity] = useState('');

    // State for editing
    const [editEntryId, setEditEntryId] = useState(null);
    const [editQuantity, setEditQuantity] = useState('');

    const fetchData = async () => {
        try {
            const [foodRes, entriesRes] = await Promise.all([
                // The dropdown needs every food, not just the first page.
                api.get('/foodmaster', { params: { all: 'true' } }),
                api.get('/foodentry', { params: { page: currentPage, limit } })
            ]);
            setFoodData(foodRes.data.data);
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

    const selectedFood = foodData.find(f => f.id === parseInt(selectedFoodId));

    const unit = unitFor(selectedFood?.food_state);
    const caloriesPerUnit = selectedFood ? selectedFood.calories_per_unit : 0;
    const totalCalories = selectedFood && quantity ? caloriesPerUnit * quantity : 0;

    const handleSave = async () => {
        if (!selectedFoodId) {
            alert('Please select a food');
            return;
        }
        if (!quantity || isNaN(quantity) || quantity <= 0) {
            alert('Please enter a valid quantity');
            return;
        }

        try {
            // The <select> and <input> hold strings; the API validates real
            // numbers, so convert before sending.
            await api.post('/foodentry/add', {
                foodId: Number(selectedFoodId),
                quantity: Number(quantity)
            });
            alert('Entry saved successfully!');
            setSelectedFoodId('');
            setQuantity('');
            fetchData();
        } catch (error) {
            console.error('Error saving entry:', error);
            alert(error.response?.data?.message || 'Failed to save entry');
        }
    };

    const handleCancelForm = () => {
        setSelectedFoodId('');
        setQuantity('');
    };

    // Start editing an entry
    const handleEdit = (entry) => {
        setEditEntryId(entry.id);
        setEditQuantity(entry.quantity);
    };

    // Cancel edit
    const handleCancelEdit = () => {
        setEditEntryId(null);
        setEditQuantity('');
    };

    // Update an entry
    const handleUpdate = async (entryId) => {
        if (!editQuantity || isNaN(editQuantity) || editQuantity <= 0) {
            alert('Please enter a valid quantity');
            return;
        }

        try {
            await api.put(`/foodentry/update/${entryId}`, {
                quantity: Number(editQuantity)
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
            await api.delete(`/foodentry/delete/${entryId}`);
            fetchData();
            alert('Entry deleted successfully!');
        } catch (error) {
            console.error('Error deleting entry:', error);
            alert('Failed to delete entry');
        }
    };

    return (
        <div className="food-entry-container">
            <h1>Food Entry</h1>

            <div className="form-container">
                <div className="form-group">
                    <label>Food</label>
                    <select
                        value={selectedFoodId}
                        onChange={(e) => setSelectedFoodId(e.target.value)}
                    >
                        <option value="">Select Food</option>
                        {foodData.map(food => (
                            <option key={food.id} value={food.id}>
                                {food.food_name}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedFoodId && (
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
                                <label>Quantity{unit && ` (${unit})`}</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder={unit === 'pc' ? 'e.g. 2' : 'e.g. 200'}
                                />
                            </div>
                            <div className="form-group half">
                                <label>Unit</label>
                                {/* Comes from the food's state on the master record,
                                    so it cannot disagree with what is stored. */}
                                <input
                                    type="text"
                                    value={unit}
                                    readOnly
                                    className="readonly-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Calories Per Unit</label>
                            <input
                                type="text"
                                value={caloriesPerUnit}
                                readOnly
                                className="readonly-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Total Calories</label>
                            <input
                                type="text"
                                value={totalCalories}
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
                    <table className="food-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Food Name</th>
                                <th>Calories</th>
                                <th>State</th>
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
                                        {entry.food_name}
                                    </td>
                                    <td>{entry.calories_per_unit}</td>
                                    <td className="capitalize">{entry.food_state}</td>
                                    <td>
                                        {editEntryId === entry.id ? (
                                            <input
                                                type="number"
                                                min="0"
                                                value={editQuantity}
                                                onChange={(e) => setEditQuantity(e.target.value)}
                                                className="quantity-input"
                                            />
                                        ) : (
                                            `${entry.quantity} ${unitFor(entry.food_state)}`.trim()
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

export default FoodEntry;