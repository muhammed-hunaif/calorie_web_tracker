import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import {
  ArrowLeft,
  Calendar,
  Apple,
  Activity,
  Flame,
  Utensils,
} from 'lucide-react';

const ReportView = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const fromDate = searchParams.get('fromDate') || '';
  const toDate = searchParams.get('toDate') || '';
  const page = searchParams.get('page') || 1;

  const [detailedData, setDetailedData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await api.get(`/reports/${date}`);
        setDetailedData(response.data);
      } catch (error) {
        console.error('Error fetching detailed report:', error);
        alert('Failed to fetch daily details.');
      } finally {
        setLoading(false);
      }
    };
    if (date) fetchDetails();
  }, [date]);

  const handleBack = () => {
    navigate(`/Report?fromDate=${fromDate}&toDate=${toDate}&page=${page}`);
  };

  const totalFoodCalories =
    detailedData?.foods?.reduce((sum, item) => sum + (Number(item.total_calories) || 0), 0) || 0;
  const totalExerciseCalories =
    detailedData?.exercises?.reduce((sum, item) => sum + (Number(item.total_burned) || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 text-sm font-medium transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reports</span>
        </button>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          <span>{date}</span>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center text-sm text-slate-400">
          Loading day breakdown...
        </div>
      ) : detailedData ? (
        <div className="space-y-6">
          {/* Summary Mini Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Consumed
                </p>
                <p className="text-xl font-bold text-amber-600 mt-0.5">
                  {Math.round(totalFoodCalories)}{' '}
                  <span className="text-xs font-normal text-slate-400">kcal</span>
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Utensils className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Burned
                </p>
                <p className="text-xl font-bold text-emerald-600 mt-0.5">
                  {Math.round(totalExerciseCalories)}{' '}
                  <span className="text-xs font-normal text-slate-400">kcal</span>
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Net Balance
                </p>
                <p className="text-xl font-bold text-indigo-600 mt-0.5">
                  {Math.round(totalFoodCalories - totalExerciseCalories)}{' '}
                  <span className="text-xs font-normal text-slate-400">kcal</span>
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Foods Column */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Apple className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900">Food Intake Records</h3>
                </div>
                <span className="text-xs text-slate-400">
                  {detailedData.foods ? detailedData.foods.length : 0} items
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[320px] text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-4">Item</th>
                      <th className="py-2.5 px-4">Quantity</th>
                      <th className="py-2.5 px-4 text-right">Calories</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detailedData.foods && detailedData.foods.length > 0 ? (
                      detailedData.foods.map((food) => (
                        <tr key={food.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3 px-4 text-sm font-semibold text-slate-800">
                            {food.food_name}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-500">
                            {food.quantity} units
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-amber-600 text-right">
                            {food.total_calories}{' '}
                            <span className="text-xs font-normal text-slate-400">kcal</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="py-8 text-center text-xs text-slate-400">
                          No food records logged on this date.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Exercises Column */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">Exercise Records</h3>
                </div>
                <span className="text-xs text-slate-400">
                  {detailedData.exercises ? detailedData.exercises.length : 0} items
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[320px] text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-4">Exercise</th>
                      <th className="py-2.5 px-4">Duration</th>
                      <th className="py-2.5 px-4 text-right">Calories</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detailedData.exercises && detailedData.exercises.length > 0 ? (
                      detailedData.exercises.map((exercise) => (
                        <tr key={exercise.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3 px-4 text-sm font-semibold text-slate-800">
                            {exercise.exercise_name}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-500">
                            {exercise.duration} mins
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-emerald-600 text-right">
                            {exercise.total_burned}{' '}
                            <span className="text-xs font-normal text-slate-400">kcal</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="py-8 text-center text-xs text-slate-400">
                          No workout activity logged on this date.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center text-sm text-slate-400">
          No details found for this date.
        </div>
      )}
    </div>
  );
};

export default ReportView;
