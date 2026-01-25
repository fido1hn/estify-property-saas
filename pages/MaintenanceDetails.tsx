
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/dbService';
import { MaintenanceRequest } from '../types';
import { ChevronLeft, Clock, Wrench, AlertTriangle, CheckCircle2, Trash2, Edit2, User } from 'lucide-react';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

export const MaintenanceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<MaintenanceRequest | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    const r = await db.maintenance.get(id!);
    if (r) setRequest(r);
    else navigate('/maintenance');
  };

  const handleStatusChange = async (status: any) => {
    if (id) {
      await db.maintenance.update(id, { status });
      loadData();
    }
  };

  const handleDelete = async () => {
    if (id) {
      await db.maintenance.delete(id);
      navigate('/maintenance');
    }
  };

  if (!request) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate('/maintenance')} className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 text-gray-500">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{request.title}</h1>
          <p className="text-sm text-gray-500">Unit {request.unit} • Reported on {request.createdAt}</p>
        </div>
        <div className="ml-auto flex gap-3">
          <button className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 text-gray-500"><Edit2 size={18} /></button>
          <button onClick={() => setIsDeleteModalOpen(true)} className="p-2.5 bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-100"><Trash2 size={18} /></button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
            <div className="flex justify-between items-start">
               <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                  request.status === 'Pending' ? 'bg-orange-50 text-orange-600' : 
                  request.status === 'In Progress' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
               }`}>
                 {request.status}
               </span>
               <span className={`text-xs font-bold uppercase tracking-widest ${
                  request.priority === 'High' ? 'text-red-500' : 'text-gray-400'
               }`}>
                 {request.priority} Priority
               </span>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Description</h3>
              <p className="text-gray-600 leading-relaxed">{request.description}</p>
            </div>
            <div className="pt-6 border-t border-gray-50 grid grid-cols-2 gap-8">
               <div className="space-y-1">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reported By</p>
                 <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                   <span className="text-sm font-medium text-gray-900">Tenant (U-{request.unit})</span>
                 </div>
               </div>
               <div className="space-y-1">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assigned Tech</p>
                 <div className="flex items-center gap-2">
                   <User size={16} className="text-gray-400" />
                   <span className="text-sm font-medium text-gray-400 italic">Not yet assigned</span>
                 </div>
               </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
             <h3 className="text-xl font-bold text-gray-900 mb-6">Activity Timeline</h3>
             <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-4 before:w-0.5 before:bg-gray-100">
                <TimelineItem title="Work order created" time={request.createdAt} status="completed" />
                <TimelineItem title="Status changed to Pending" time={request.createdAt} status="active" />
                <TimelineItem title="Technician review" time="TBD" status="pending" />
             </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-black text-white p-8 rounded-[40px] space-y-6">
            <h3 className="font-bold text-lg">Update Workflow</h3>
            {request.status === 'Pending' && (
              <button onClick={() => handleStatusChange('In Progress')} className="w-full py-4 bg-blue-500 text-white font-bold rounded-2xl hover:bg-blue-600 transition-all">Start Work</button>
            )}
            {request.status === 'In Progress' && (
              <button onClick={() => handleStatusChange('Completed')} className="w-full py-4 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 transition-all">Mark Complete</button>
            )}
            <button className="w-full py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all">Assign Vendor</button>
          </div>

          <div className="bg-blue-50 p-8 rounded-[40px] border border-blue-100 space-y-4">
             <div className="flex items-center gap-2 text-blue-600">
               <Clock size={20} />
               <h3 className="font-bold">SLA Tracking</h3>
             </div>
             <p className="text-sm text-blue-700 leading-relaxed">
               This request is within the 24-hour response window for {request.priority} priority issues.
             </p>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Cancel Work Order"
        message="Are you sure you want to delete this maintenance request? This history will be lost."
      />
    </div>
  );
};

const TimelineItem: React.FC<{title: string, time: string, status: 'completed' | 'active' | 'pending'}> = ({title, time, status}) => (
  <div className="relative pl-12">
    <div className={`absolute left-2.5 top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
      status === 'completed' ? 'bg-green-500' : status === 'active' ? 'bg-orange-500' : 'bg-gray-200'
    }`}></div>
    <p className="text-sm font-bold text-gray-900">{title}</p>
    <p className="text-[10px] text-gray-400 uppercase font-bold">{time}</p>
  </div>
);
