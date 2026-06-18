import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/FoodEntry.css';

const FoodEntry = () => {
    const [foodData, setFoodData] = useState([]);
    const [entries, setEntries] = useState([]);

    const formatDate = (dateObj) => {
        const d = String(dateObj.getDate()).padStart(2, '0');
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const y = dateObj.getFullYear();
        return `${d}-${m}-${y}`;
    };

    // Form state
    const [date, setDate] = useState(formatDate(new Date()));
    const [selectedFoodId, setSelectedFoodId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [measure, setMeasure] = useState('');

    useEffect(() => {
        const food = foodData.find(f => f.id === parseInt(selectedFoodId));
        if (food) {
            setMeasure(food.food_state || '');
        } else {
            setMeasure('');
        }
    }, [selectedFoodId, foodData]);

    // State for editing
    const [editEntryId, setEditEntryId] = useState(null);
    const [editQuantity, setEditQuantity] = useState('');

    const fetchData = async () => {
        try {
            const [foodRes, entriesRes] = await Promise.all([
                axios.get('http://localhost:5000/api/foodmaster'),
                axios.get('http://localhost:5000/api/foodentry')
            ]);
            setFoodData(foodRes.data);
            setEntries(entriesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
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
            await axios.post('http://localhost:5000/api/foodentry/add', {
                foodId: selectedFoodId,
                quantity: quantity
            });
            alert('Entry saved successfully!');
            setSelectedFoodId('');
            setQuantity('');
            fetchData();
        } catch (error) {
            console.error('Error saving entry:', error);
            alert('Failed to save entry');
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
            await axios.put(`http://localhost:5000/api/foodentry/update/${entryId}`, {
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
            await axios.delete(`http://localhost:5000/api/foodentry/delete/${entryId}`);
            fetchData();
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
                                    <option value="">Select Measure</option>
                                    <option value="kg">kg</option>
                                    <option value="g">g</option>
                                    <option value="ml">ml</option>
                                    <option value="l">l</option>
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
                                <th>Dateww</th>
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
            </div>
        </div>
    );
};

export default FoodEntry;