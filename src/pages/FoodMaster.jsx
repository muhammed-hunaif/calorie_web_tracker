import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
} from 'lucide-react';

const foodSchema = z.object({
  foodName: z.string().min(1, 'Food Name is required'),
  caloriesPerUnit: z.coerce.number().positive('Calories must be a positive number'),
  foodState: z.string().min(1, 'Food State is required'),
});

const FoodMaster = () => {
  const [showForm, setShowForm] = useState(false);
  const [foods, setFoods] = useState([]);
  const [editId, setEditId] = useState(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const limit = 10;

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(foodSchema),
    defaultValues: {
      foodName: '',
      caloriesPerUnit: '',
      foodState: '',
    },
  });

  const selectedState = watch('foodState');

  const fetchFoods = async () => {
    try {
      const response = await api.get('/foodmaster', { params: { page: currentPage, limit } });
      setFoods(response.data.data);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);

      if (response.data.totalPages > 0 && currentPage > response.data.totalPages) {
        setSearchParams({ page: response.data.totalPages });
      }
    } catch (error) {
      console.error('Error fetching foods:', error);
    }
  };

  useEffect(() => {
    fetchFoods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

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
    if (window.confirm('Are you sure you want to delete this food item?')) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Food Master</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your food catalog, portions, and default calorie values.
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => {
              setEditId(null);
              setImageUrl(null);
              reset();
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Food</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form Card */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs max-w-xl">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">
              {editId ? 'Edit Food Item' : 'Add New Food Item'}
            </h2>
            <button
              type="button"
              onClick={handleCancel}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Food Name
              </label>
              <input
                type="text"
                {...register('foodName')}
                placeholder="e.g. Boiled Egg, White Rice"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
              {errors.foodName && (
                <p className="text-xs text-rose-500 mt-1">{errors.foodName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Calories Per Unit
              </label>
              <input
                type="number"
                step="any"
                {...register('caloriesPerUnit')}
                placeholder="e.g. 78"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
              {errors.caloriesPerUnit && (
                <p className="text-xs text-rose-500 mt-1">{errors.caloriesPerUnit.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Food State
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { value: 'Solid', label: 'Solid (g)' },
                  { value: 'Liquid', label: 'Liquid (ml)' },
                  { value: 'Piece', label: 'Piece (pc)' },
                ].map((item) => (
                  <label
                    key={item.value}
                    className={`flex items-center justify-center px-3 py-2 rounded-lg border text-sm font-medium cursor-pointer transition ${
                      selectedState === item.value
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      value={item.value}
                      {...register('foodState')}
                      className="sr-only"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
              {errors.foodState && (
                <p className="text-xs text-rose-500 mt-1">{errors.foodState.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Image (Optional)
              </label>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={handleImageChange}
                disabled={uploading}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
              />
              {uploading && (
                <p className="text-xs text-indigo-600 mt-1 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 animate-spin" /> Uploading image...
                </p>
              )}
              {imageUrl && !uploading && (
                <div className="flex items-center gap-3 mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                  <img
                    src={`${imageUrl}?tr=w-120,h-120,fo-auto`}
                    alt="Food preview"
                    className="w-12 h-12 object-cover rounded-md border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    className="text-xs font-medium text-rose-600 hover:text-rose-700"
                  >
                    Remove Image
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5 pt-3">
              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium shadow-xs transition cursor-pointer"
              >
                {editId ? 'Update Food' : 'Save Food'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-16">#</th>
                <th className="py-3 px-4 w-16">Image</th>
                <th className="py-3 px-4">Food Name</th>
                <th className="py-3 px-4">Calories / Unit</th>
                <th className="py-3 px-4">Portion State</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {foods.length > 0 ? (
                foods.map((food) => {
                  const stateBadgeStyles =
                    food.food_state === 'Solid'
                      ? 'bg-blue-50 text-blue-700 border-blue-100'
                      : food.food_state === 'Liquid'
                      ? 'bg-cyan-50 text-cyan-700 border-cyan-100'
                      : 'bg-purple-50 text-purple-700 border-purple-100';

                  return (
                    <tr key={food.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 text-xs font-mono text-slate-400">{food.id}</td>
                      <td className="py-3 px-4">
                        {food.image_url ? (
                          <img
                            src={`${food.image_url}?tr=w-48,h-48,fo-auto`}
                            alt={food.food_name}
                            className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                            <UtensilsCrossed className="w-4 h-4" />
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-slate-900">
                        {food.food_name}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        <span className="font-medium text-slate-900">{food.calories_per_unit}</span>{' '}
                        <span className="text-xs text-slate-400">kcal</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${stateBadgeStyles}`}
                        >
                          {food.food_state}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleEdit(food)}
                          title="Edit"
                          className="inline-flex p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(food.id)}
                          title="Delete"
                          className="inline-flex p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-sm text-slate-400">
                    No food records found. Click &quot;Add Food&quot; to create your first item.
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

export default FoodMaster;
