import { useState, useEffect } from 'react';
import api from '../api/axios';
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
    resolver: zodResolver(foodSchema),
    defaultValues: {
      foodName: '',
      caloriesPerUnit: '',
      foodState: '',
    },
  });

  const fetchFoods = async () => {
    try {
      const response = await api.get('/foodmaster', { params: { page: currentPage, limit } });
      setFoods(response.data.data);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);

      // Deleting the last row of the last page can leave us past the end.
      if (response.data.totalPages > 0 && currentPage > response.data.totalPages) {
        setSearchParams({ page: response.data.totalPages });
      }
    } catch (error) {
      console.error('Error fetching foods:', error);
    }
  };

  useEffect(() => {
    fetchFoods();
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
        const response = await api.put(`/foodmaster/update/${editId}`, payload);
        if (response.status === 200) {
          alert('Food updated successfully!');
        }
      } else {
        const response = await api.post('/foodmaster/add', payload);
        if (response.status === 201 || response.status === 200) {
          alert('Food added successfully!');
        }
      }
      setShowForm(false);
      setEditId(null);
      setImageUrl(null);
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
    setImageUrl(food.image_url || null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this food?')) {
      try {
        const response = await api.delete(`/foodmaster/delete/${id}`);
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
    setImageUrl(null);
    reset();
  };

  return (
    <div className="food-master-container">
      <h1>Food Master</h1>

      {!showForm ? (
        <button
          onClick={() => {
            setEditId(null);
            setImageUrl(null);
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
                <img src={`${imageUrl}?tr=w-120,h-120,fo-auto`} alt="Food preview" />
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
      <div className="food-table-container">
        <table className="food-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Food Name</th>
              <th>Calories</th>
              <th>State</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {foods.length > 0 ? (
              foods.map((food) => (
                <tr key={food.id}>
                  <td>{food.id}</td>
                  <td>
                    {food.image_url ? (
                      <img
                        src={`${food.image_url}?tr=w-48,h-48,fo-auto`}
                        alt={food.food_name}
                        className="row-thumb"
                        loading="lazy"
                      />
                    ) : (
                      <span className="no-image">-</span>
                    )}
                  </td>
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
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No food records found</td>
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

export default FoodMaster;