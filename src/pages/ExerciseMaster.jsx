import { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import '../styles/ExerciseMaster.css';

const exerciseSchema = z.object({
  exerciseName: z.string().min(1, 'Exercise Name is required'),
  unit: z.string().min(1, 'Unit is required'),
  caloriesBurned: z.coerce.number().positive('Calories must be a positive number'),
});

const ExerciseMaster = () => {
  const [showForm, setShowForm] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [editId, setEditId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      exerciseName: '',
      unit: '',
      caloriesBurned: '',
    },
  });

  const fetchExercises = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/exercisemaster');
      setExercises(response.data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (editId) {
        const response = await axios.put(`http://localhost:5000/api/exercisemaster/update/${editId}`, data);
        if (response.status === 200) {
          alert('Exercise updated successfully!');
        }
      } else {
        const response = await axios.post('http://localhost:5000/api/exercisemaster/add', data);
        if (response.status === 201 || response.status === 200) {
          alert('Exercise added successfully!');
        }
      }
      setShowForm(false);
      setEditId(null);
      reset();
      fetchExercises();
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred while saving.';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleEdit = (exercise) => {
    setEditId(exercise.id);
    setValue('exerciseName', exercise.exercise_name);
    setValue('unit', exercise.unit);
    setValue('caloriesBurned', exercise.calories_burned);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this exercise?')) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/exercisemaster/delete/${id}`);
        if (response.status === 200) {
          alert('Exercise deleted successfully!');
          fetchExercises();
        }
      } catch (error) {
        console.error('Error deleting exercise:', error);
        alert('Failed to delete exercise.');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    reset();
  };

  return (
    <div className="exercise-master-container">
      <h1>Exercise Master</h1>
      
      {!showForm ? (
        <button 
          onClick={() => {
            setEditId(null);
            reset();
            setShowForm(true);
          }}
          className="add-exercise-btn"
        >
          Add Exercise
        </button>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="exercise-form-container">
          <div className="form-group">
            <label className="form-label">Exercise Name:</label>
            <input 
              type="text" 
              {...register('exerciseName')}
              className="form-input"
              placeholder="Enter exercise name"
            />
            {errors.exerciseName && <p className="error-message">{errors.exerciseName.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Unit:</label>
            <select 
              {...register('unit')}
              className="form-select"
            >
              <option value="" disabled>Select Unit</option>
              <option value="min">min</option>
              <option value="rep">rep</option>
              <option value="km">km</option>
            </select>
            {errors.unit && <p className="error-message">{errors.unit.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Calories Burned:</label>
            <input 
              type="number" 
              {...register('caloriesBurned')}
              className="form-input"
              placeholder="Enter calories burned"
            />
            {errors.caloriesBurned && <p className="error-message">{errors.caloriesBurned.message}</p>}
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
      <div className="exercise-table-container">
        <table className="exercise-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Exercise Name</th>
              <th>Unit</th>
              <th>Calories Burned</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exercises.length > 0 ? (
              exercises.map((exercise) => (
                <tr key={exercise.id}>
                  <td>{exercise.id}</td>
                  <td>{exercise.exercise_name}</td>
                  <td>{exercise.unit}</td>
                  <td>{exercise.calories_burned}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(exercise)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(exercise.id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No exercise records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
     
    </div>
  );
};

export default ExerciseMaster;
