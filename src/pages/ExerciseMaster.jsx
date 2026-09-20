import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSearchParams } from 'react-router-dom';
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
  // Pagination is done by the API now; these come from the response envelope.
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  // Image state for the form: the ImageKit URL, plus an in-flight flag.
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const limit = 10;

  const handlePageChange = (newPage) => {
    const params = { page: newPage };
    setSearchParams(params);
  };

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
      const response = await api.get('/exercisemaster', { params: { page: currentPage, limit } });
      setExercises(response.data.data);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);

      // Deleting the last row of the last page can leave us past the end.
      if (response.data.totalPages > 0 && currentPage > response.data.totalPages) {
        setSearchParams({ page: response.data.totalPages });
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  useEffect(() => {
    fetchExercises();
    // Refetch whenever the page changes - the server returns that page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Sends the file to our backend, which uploads it to ImageKit with the
  // private key and returns the hosted URL. The key never reaches the browser.
  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

      const response = await api.post('/upload/image', { file: dataUrl, fileName: file.name });
      setImageUrl(response.data.url);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(error.response?.data?.message || 'Image upload failed.');
      event.target.value = '';
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, imageUrl };
      if (editId) {
        const response = await api.put(`/exercisemaster/update/${editId}`, payload);
        if (response.status === 200) {
          alert('Exercise updated successfully!');
        }
      } else {
        const response = await api.post('/exercisemaster/add', payload);
        if (response.status === 201 || response.status === 200) {
          alert('Exercise added successfully!');
        }
      }
      setShowForm(false);
      setEditId(null);
      setImageUrl(null);
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
    setImageUrl(exercise.image_url || null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this exercise?')) {
      try {
        const response = await api.delete(`/exercisemaster/delete/${id}`);
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
    setImageUrl(null);
    reset();
  };

  return (
    <div className="exercise-master-container">
      <h1>Exercise Master</h1>

      {!showForm ? (
        <button
          onClick={() => {
            setEditId(null);
            setImageUrl(null);
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

          <div className="form-group">
            <label className="form-label">Image (optional):</label>
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp, image/gif"
              onChange={handleImageChange}
              className="form-input"
              disabled={uploading}
            />
            {uploading && <p className="error-message">Uploading image...</p>}
            {imageUrl && !uploading && (
              <div className="image-preview">
                <img src={`${imageUrl}?tr=w-120,h-120,fo-auto`} alt="Exercise preview" />
                <button type="button" className="cancel-btn" onClick={() => setImageUrl(null)}>
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="button-group">
            <button
              type="submit"
              className="save-btn"
              disabled={uploading}
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
              <th>Image</th>
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
                  <td>
                    {exercise.image_url ? (
                      <img
                        src={`${exercise.image_url}?tr=w-48,h-48,fo-auto`}
                        alt={exercise.exercise_name}
                        className="row-thumb"
                        loading="lazy"
                      />
                    ) : (
                      <span className="no-image">-</span>
                    )}
                  </td>
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
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No exercise records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
  );
};

export default ExerciseMaster;
