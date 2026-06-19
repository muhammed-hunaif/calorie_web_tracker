import { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSearchParams } from 'react-router-dom';
import '../styles/FoodMaster.css';

const foodSchema = z.object({
  foodName: z.string().min(1, 'Food Name is required'),
  caloriesPerUnit: z.coerce.number().positive('Calories must be a positive number'),
  foodState: z.string().min(1, 'Food State is required'),
});

const FoodMaster = () => {
  const [showForm, setShowForm] = useState(false);
  const [foods, setFoods] = useState([]);
  const [editId, setEditId] = useState(null);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const limit = 10;

  const handlePageChange = (newPage) => {
    const params = { page: newPage };
    setSearchParams(params);
  };

  const totalPages = Math.ceil(foods.length / limit);
  const startIndex = (currentPage - 1) * limit;
  const paginatedFoods = foods.slice(startIndex, startIndex + limit);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(foodSchema),
    defaultValues: {
      foodName: '',
      caloriesPerUnit: '',
      foodState: '',
    },
  });

  const fetchFoods = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/foodmaster');
      setFoods(response.data);
    } catch (error) {
      console.error('Error fetching foods:', error);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (editId) {
        const response = await axios.put(`http://localhost:5000/api/foodmaster/update/${editId}`, data);
        if (response.status === 200) {
          alert('Food updated successfully!');
        }
      } else {
        const response = await axios.post('http://localhost:5000/api/foodmaster/add', data);
        if (response.status === 201 || response.status === 200) {
          alert('Food added successfully!');
        }
      }
      setShowForm(false);
      setEditId(null);
      reset();
      fetchFoods();
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred while saving.';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleEdit = (food) => {
    setEditId(food.id);
    setValue('foodName', food.food_name);
    setValue('caloriesPerUnit', food.calories_per_unit);
    setValue('foodState', food.food_state);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this food?')) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/foodmaster/delete/${id}`);
        if (response.status === 200) {
          alert('Food deleted successfully!');
          fetchFoods();
        }
      } catch (error) {
        console.error('Error deleting food:', error);
        alert('Failed to delete food.');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    reset();
  };

  return (
    <div className="food-master-container">
      <h1>Food Master</h1>

      {!showForm ? (
        <button
          onClick={() => {
            setEditId(null);
            reset();
            setShowForm(true);
          }}
          className="add-food-btn"
        >
          Add Food
        </button>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="food-form-container">
          <div className="form-group">
            <label className="form-label">Food Name:</label>
            <input
              type="text"
              {...register('foodName')}
              className="form-input"
              placeholder="Enter food name"
            />
            {errors.foodName && <p className="error-message">{errors.foodName.message}</p>}
          </div>



          <div className="form-group">
            <label className="form-label">Calories Per Unit:</label>
            <input
              type="number"
              {...register('caloriesPerUnit')}
              className="form-input"
              placeholder="Enter calories"
            />
            {errors.caloriesPerUnit && <p className="error-message">{errors.caloriesPerUnit.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Food State:</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="Solid"
                  {...register('foodState')}
                /> Solid
              </label>
              <label>
                <input
                  type="radio"
                  value="Liquid"
                  {...register('foodState')}
                /> Liquid
              </label>
              <label>
                <input
                  type="radio"
                  value="Piece"
                  {...register('foodState')}
                /> Piece
              </label>
            </div>
            {errors.foodState && <p className="error-message">{errors.foodState.message}</p>}
          </div>

          <div className="button-group">
            <button
              type="submit"
              className="save-btn"
            >
              {editId ? 'Update' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Data Table */}
      <div className="food-table-container">
        <table className="food-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Food Name</th>
              <th>Calories</th>
              <th>State</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedFoods.length > 0 ? (
              paginatedFoods.map((food) => (
                <tr key={food.id}>
                  <td>{food.id}</td>
                  <td>{food.food_name}</td>
                  <td>{food.calories_per_unit}</td>
                  <td>{food.food_state}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(food)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(food.id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No food records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {foods.length > 0 && (
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

export default FoodMaster;