import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useSearchParams } from 'react-router-dom';
import '../styles/FoodEntry.css';

const FoodEntry = () => {
    const [foodData, setFoodData] = useState([]);
    const [entries, setEntries] = useState([]);

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get('page')) || 1;
    const limit = 10;

    const handlePageChange = (newPage) => {
        const params = { page: newPage };
        setSearchParams(params);
    };

    const totalPages = Math.ceil(entries.length / limit);
    const startIndex = (currentPage - 1) * limit;
    const paginatedEntries = entries.slice(startIndex, startIndex + limit);

    const formatDate = (dateObj) => {
        const d = String(dateObj.getDate()).padStart(2, '0');
        // with padstart=05-06-2026
        // without padstart=5-6-2026
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const y = dateObj.getFullYear();
        return `${d}-${m}-${y}`;
    };

    // Form state
    const [date] = useState(formatDate(new Date()));
    const [selectedFoodId, setSelectedFoodId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [measure, setMeasure] = useState('');

    // State for editing
    const [editEntryId, setEditEntryId] = useState(null);
    const [editQuantity, setEditQuantity] = useState('');

    const fetchData = async () => {
        try {
            const [foodRes, entriesRes] = await Promise.all([
                api.get('/foodmaster'),
                api.get('/foodentry')
            ]);
            setFoodData(foodRes.data);
            setEntries(entriesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
    }, []);

    const selectedFood = foodData.find(f => f.id === parseInt(selectedFoodId));

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
            await api.post('/foodentry/add', {
                foodId: selectedFoodId,
                quantity: quantity
            });
            alert('Entry saved successfully!');
            setSelectedFoodId('');
            setQuantity('');
            setMeasure('');
            fetchData();
        } catch (error) {
            console.error('Error saving entry:', error);
            alert('Failed to save entry');
        }
    };

    const handleCancelForm = () => {
        setSelectedFoodId('');
        setQuantity('');
        setMeasure('');
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
                quantity: editQuantity
            });
            alert('Entry updated successfully!');
            setEditEntryId(null);
            fetchData();
        } catch (error) {
            console.error('Error updating entry:', error);
            alert('Failed to update entry');
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
                        onChange={(e) => {
                            const newId = e.target.value;
                            setSelectedFoodId(newId);
                            const food = foodData.find(f => f.id === parseInt(newId));
                            if (food) {
                                setMeasure(food.food_state || '');
                            } else {
                                setMeasure('');
                            }
                        }}
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
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder="e.g. 200"
                                />
                            </div>
                            <div className="form-group half">
                                <label>Measure</label>
                                <select
                                    value={measure}
                                    onChange={(e) => setMeasure(e.target.value)}
                                    className="form-input capitalize"
                                >
                                    <option value=""> Measure</option>
                                    <option value="g">g</option>
                                    <option value="ml">ml</option>
                                    <option value="P">P</option>
                                </select>
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
                            {paginatedEntries.map((entry) => (
                                <tr key={entry.id}>
                                    <td>{new Date(entry.created_at).toLocaleDateString()}</td>
                                    <td>{entry.food_name}</td>
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
                                            entry.quantity
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

                {entries.length > 0 && (
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
        </div>
    );
};

export default FoodEntry;