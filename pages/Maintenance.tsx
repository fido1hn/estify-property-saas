import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MaintenanceRequest, UserRole } from "../types";
import {
  Sparkles,
  Plus,
  X,
  Trash2,
  Edit2,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { summarizeMaintenanceRequest } from "../services/geminiService";
import { db } from "../services/dbService";
import { DeleteConfirmationModal } from "../components/DeleteConfirmationModal";

interface MaintenanceProps {
  role: UserRole;
}

export const Maintenance: React.FC<MaintenanceProps> = ({ role }) => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [newRequestDesc, setNewRequestDesc] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    unit: "",
    priority: "Medium" as any,
    status: "Pending" as any,
  });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    const data = await db.maintenance.list();
    setRequests(data);
  };

  // const handleAiAnalyze = async () => {
  //   if (!newRequestDesc) return;
  //   setIsAiLoading(true);
  //   // const result = await summarizeMaintenanceRequest(newRequestDesc);
  //   setAiAnalysis(result);
  //   setFormData({
  //     ...formData,
  //     title: result.category || "General Repair",
  //     description: newRequestDesc,
  //     priority: result.priority || "Medium",
  //   });
  //   setIsAiLoading(false);
  //   setIsModalOpen(true);
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.maintenance.create(formData);
    setIsModalOpen(false);
    setNewRequestDesc("");
    setAiAnalysis(null);
    loadRequests();
  };

  const handleUpdateStatus = async (
    e: React.MouseEvent,
    id: string,
    status: any,
  ) => {
    e.stopPropagation();
    await db.maintenance.update(id, { status });
    loadRequests();
  };

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      await db.maintenance.delete(itemToDelete);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      loadRequests();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance</h1>
          <p className="text-gray-500 mt-1">
            Track work orders and repair requests.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-lg shadow-black/10">
          <Plus size={18} /> New Request
        </button>
      </header>

      {(role === UserRole.TENANT || role === UserRole.COMPANY_ADMIN) && (
        <div className="bg-orange-50 border border-orange-100 p-8 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-orange-600">
            <Sparkles size={20} />
            <h3 className="font-bold">AI Maintenance Assistant</h3>
          </div>
          <p className="text-sm text-orange-700">
            Describe your issue. Our AI will automatically categorize it and set
            priority.
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <textarea
              className="flex-1 p-4 rounded-2xl border-none ring-1 ring-orange-200 focus:ring-2 focus:ring-orange-500 bg-white text-sm"
              placeholder="Example: The heater in unit 402 is vibrating and smells like smoke..."
              value={newRequestDesc}
              onChange={(e) => setNewRequestDesc(e.target.value)}
              rows={3}
            />
            <button
              // onClick={handleAiAnalyze}
              disabled={isAiLoading || !newRequestDesc}
              className="px-8 py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 disabled:opacity-50 transition-all self-end">
              {isAiLoading ? "Analyzing..." : "Smart Auto-Fill"}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {requests.map((req) => (
          <div
            key={req.id}
            onClick={() => navigate(`/maintenance/${req.id}`)}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-orange-200 transition-all flex flex-col justify-between group cursor-pointer">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    req.status === "Pending"
                      ? "bg-orange-50 text-orange-600"
                      : req.status === "In Progress"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-green-50 text-green-600"
                  }`}>
                  {req.status}
                </span>
                <div className="flex gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest ${
                      req.priority === "High"
                        ? "text-red-500"
                        : req.priority === "Medium"
                          ? "text-orange-500"
                          : "text-gray-400"
                    }`}>
                    {req.priority} Priority
                  </span>
                  <button
                    onClick={(e) => confirmDelete(e, req.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                {req.title}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                {req.description}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                  {req.unit}
                </div>
                <span className="text-xs text-gray-400">{req.createdAt}</span>
              </div>
              <div className="flex gap-2">
                {req.status === "Pending" && (
                  <button
                    onClick={(e) =>
                      handleUpdateStatus(e, req.id, "In Progress")
                    }
                    className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                    Start
                  </button>
                )}
                {req.status === "In Progress" && (
                  <button
                    onClick={(e) => handleUpdateStatus(e, req.id, "Completed")}
                    className="text-[10px] font-bold bg-green-50 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors">
                    Finish
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">
                New Work Order
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Issue Title
                </label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Unit
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. U-402"
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Priority
                  </label>
                  <select
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as any,
                      })
                    }>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Status
                  </label>
                  <select
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as any,
                      })
                    }>
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Description
                </label>
                <textarea
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-lg shadow-black/20">
                  Create Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Work Order"
        message="Are you sure you want to delete this maintenance record?"
      />
    </div>
  );
};
