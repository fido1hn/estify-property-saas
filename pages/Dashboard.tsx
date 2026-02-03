
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { TrendingUp, Users, Building, AlertCircle, ArrowUpRight, X } from 'lucide-react';
import { useSummaryMetrics, useMonthlyRevenue } from '../hooks/useAnalytics';
import { useCreateProperty } from '../hooks/useProperties';

interface DashboardProps {
  role: UserRole;
}

export const Dashboard: React.FC<DashboardProps> = ({ role }) => {
  const navigate = useNavigate();
  const { metrics, isPending: isMetricsLoading } = useSummaryMetrics();
  const { revenueData = [], isPending: isRevenueLoading } = useMonthlyRevenue();
  const { createProperty } = useCreateProperty();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: 'Residential' as any,
    units: 0,
    occupancy: 0,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80'
  });

  const handleExport = () => {
    alert('Generating financial report... The download will start shortly.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createProperty(formData, {
        onSuccess: () => {
            setIsModalOpen(false);
            setFormData({
                name: '',
                address: '',
                type: 'Residential',
                units: 0,
                occupancy: 0,
                image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80'
            });
            alert('Property added successfully to the database!');
        }
    });
  };

  if (isMetricsLoading || isRevenueLoading) return null;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={handleExport}
            className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs md:text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Export Report
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2 bg-orange-500 text-white rounded-xl text-xs md:text-sm font-medium hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
          >
            Add Property
          </button>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard label="Active Properties" value={metrics.activeProperties.toString()} change="+12%" trend="up" icon={<Building className="text-orange-500" />} />
        <StatCard label="New Leads" value={metrics.newLeads.toString()} change="+15%" trend="up" icon={<Users className="text-blue-500" />} />
        <StatCard label="Total Sales" value={metrics.totalSales} change="+40%" trend="up" icon={<TrendingUp className="text-green-500" />} />
        <StatCard label="Overdue Rent" value={metrics.overdueRent} change="-5%" trend="down" icon={<AlertCircle className="text-red-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 text-sm md:text-base">Revenue Performance</h3>
            <select className="bg-gray-50 border-none text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-lg focus:ring-0">
              <option>Monthly</option>
              <option>Weekly</option>
            </select>
          </div>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6 md:space-y-8">
          <div 
            onClick={() => navigate('/properties/1')}
            className="bg-orange-500 text-white p-6 rounded-3xl relative overflow-hidden group cursor-pointer"
          >
             <div className="relative z-10 h-full flex flex-col justify-between min-h-[180px] md:min-h-[220px]">
                <div>
                  <h4 className="text-orange-200 text-[10px] md:text-sm font-bold uppercase tracking-widest mb-2">Featured Property</h4>
                  <h3 className="text-xl md:text-2xl font-bold leading-tight">Skyline<br/>Residence</h3>
                </div>
                <div className="flex gap-6 md:gap-8">
                  <div>
                    <p className="text-orange-100 text-[10px] mb-1">Total Units</p>
                    <p className="text-lg md:text-xl font-bold">48</p>
                  </div>
                  <div>
                    <p className="text-orange-100 text-[10px] mb-1">Occupancy</p>
                    <p className="text-lg md:text-xl font-bold">92%</p>
                  </div>
                </div>
                <ArrowUpRight className="absolute top-0 right-0 m-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
             </div>
             <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80" className="absolute top-0 left-0 w-full h-full object-cover opacity-20 pointer-events-none" />
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6 text-sm md:text-base">Property Conditions</h3>
            <div className="space-y-6">
              <ConditionProgress label="On repairment progress" value={26} total={50} color="bg-orange-500" />
              <ConditionProgress label="Awaiting for repairment" value={14} total={50} color="bg-orange-200" />
              <ConditionProgress label="On request" value={9} total={50} color="bg-black" />
            </div>
            <button 
              onClick={() => navigate('/maintenance')}
              className="w-full mt-8 py-3 md:py-4 bg-black text-white text-sm font-bold rounded-2xl hover:bg-gray-800 transition-colors"
            >
              Maintenance Details
            </button>
          </div>
        </div>
      </div>

      {/* Property Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Add Property</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-400"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Property Name</label>
                <input required type="text" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Address</label>
                <input required type="text" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} >
                    <option>Residential</option>
                    <option>Commercial</option>
                    <option>Industrial</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Units</label>
                  <input type="number" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm" value={formData.units} onChange={e => setFormData({...formData, units: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Image URL</label>
                <input type="text" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20">
                  Create Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{label: string, value: string, change: string, trend: 'up' | 'down', icon: React.ReactNode}> = ({label, value, change, trend, icon}) => (
  <div className="bg-white p-4 md:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 md:p-3 bg-gray-50 rounded-2xl scale-90 md:scale-100">{icon}</div>
      <span className={`text-[10px] md:text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
        {change} {trend === 'up' ? '↑' : '↓'}
      </span>
    </div>
    <div>
      <p className="text-[10px] md:text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-xl md:text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const ConditionProgress: React.FC<{label: string, value: number, total: number, color: string}> = ({label, value, total, color}) => (
  <div>
    <div className="flex justify-between text-[10px] md:text-xs mb-2">
      <span className="text-gray-500">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{width: `${(value/total)*100}%`}}></div>
    </div>
  </div>
);
