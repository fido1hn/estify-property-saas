
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, Users, DollarSign, PieChart as PieChartIcon, Download, Calendar, Sparkles } from 'lucide-react';
import { db } from '../services/dbService';

const COLORS = ['#f97316', '#000000', '#94a3b8'];

export const Analytics: React.FC = () => {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [occupancyData, setOccupancyData] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [rev, occ, dist, met] = await Promise.all([
        db.analytics.getMonthlyRevenue(),
        db.analytics.getOccupancyTrend(),
        db.analytics.getRevenueDistribution(),
        db.analytics.getSummaryMetrics(),
      ]);
      setRevenueData(rev);
      setOccupancyData(occ);
      setDistributionData(dist);
      setMetrics(met);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full text-gray-400">
      Loading analytics...
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">Deep dive into your portfolio's performance.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">
            <Calendar size={18} /> Last 6 Months
          </button>
          <button onClick={() => alert('Exporting data...')} className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-lg shadow-black/10">
            <Download size={18} /> Export Data
          </button>
        </div>
      </header>

      {/* AI Performance Insight */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 rounded-3xl text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
            <Sparkles size={32} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">AI Performance Summary</h3>
            <p className="text-orange-100 text-sm max-w-2xl">
              Your portfolio is performing 14% above market average for the Silicon Valley region. 
              Recommendation: Increase residential rates by 2.5% for upcoming renewals to optimize yield without impacting occupancy.
            </p>
          </div>
          <button onClick={() => alert('Opening optimization plan...')} className="px-6 py-3 bg-white text-orange-600 font-bold rounded-2xl hover:bg-orange-50 transition-colors whitespace-nowrap">
            View Optimization Plan
          </button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue vs Expenses */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6">Revenue vs Operating Expenses</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                />
                <Legend iconType="circle" />
                <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} name="Gross Revenue" />
                <Bar dataKey="expenses" fill="#000000" radius={[4, 4, 0, 0]} name="Total Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Trend */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6">Occupancy Rate Over Time (%)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={[80, 100]} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                />
                <Line type="monotone" dataKey="rate" stroke="#f97316" strokeWidth={4} dot={{r: 6, fill: '#f97316', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Portfolio Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6">Revenue Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-2 gap-4">
          <MetricCard label="Net Yield" value={metrics.netYield} trend="+0.4%" isPositive={true} />
          <MetricCard label="Churn Rate" value={metrics.churnRate} trend="-0.8%" isPositive={true} />
          <MetricCard label="Average Rent" value={metrics.avgRent} trend="+$120" isPositive={true} />
          <MetricCard label="Maintenance Cost" value={metrics.maintenanceCost} trend="+$1,500" isPositive={false} />
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{label: string, value: string, trend: string, isPositive: boolean}> = ({label, value, trend, isPositive}) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
    <div>
      <h4 className="text-2xl font-bold text-gray-900 mt-2">{value}</h4>
      <p className={`text-xs font-bold mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {trend} vs last month
      </p>
    </div>
  </div>
);
