
import React, { useState, useEffect } from 'react';
import { Invoice } from '../types';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Trash2, Download } from 'lucide-react';
import { db } from '../services/dbService';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

export const Billing: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    const data = await db.billing.list();
    setInvoices(data);
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      await db.billing.delete(itemToDelete);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      loadInvoices();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
          <p className="text-gray-500 mt-1">Track revenue, invoices, and expense transactions.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-lg shadow-black/10">
            Generate Invoices
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Balance & Overview */}
        <div className="space-y-6">
          <div className="bg-gray-900 text-white p-8 rounded-3xl space-y-8 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <CreditCard size={32} />
                <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full border border-white/20">Active</span>
              </div>
              <div className="mt-12">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-widest mb-2">Total Balance</p>
                <p className="text-4xl font-bold">$124,560.80</p>
              </div>
              <div className="mt-12 flex justify-between items-center">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full border-2 border-gray-900 bg-orange-500"></div>
                  <div className="w-10 h-10 rounded-full border-2 border-gray-900 bg-blue-500"></div>
                  <div className="w-10 h-10 rounded-full border-2 border-gray-900 bg-white/20 flex items-center justify-center text-[10px] font-bold">+12</div>
                </div>
                <button className="text-sm font-bold bg-orange-500 px-6 py-3 rounded-2xl hover:bg-orange-600 transition-colors">Withdraw</button>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 rounded-full -mr-32 -mt-32 opacity-10"></div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Financial Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg"><ArrowDownLeft size={20}/></div>
                  <div>
                    <p className="text-[10px] font-bold text-green-600 uppercase">Rent Income</p>
                    <p className="font-bold text-gray-900">$45,200</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-green-600">+8%</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 text-red-600 rounded-lg"><ArrowUpRight size={20}/></div>
                  <div>
                    <p className="text-[10px] font-bold text-red-600 uppercase">Expenses</p>
                    <p className="font-bold text-gray-900">$12,840</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-red-600">-2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Invoices Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
             <div className="p-6 border-b border-gray-50 flex items-center justify-between">
               <h3 className="font-bold text-gray-900">Recent Invoices</h3>
               <button className="p-2.5 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors"><Download size={20}/></button>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Invoice</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Tenant</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                   {invoices.map(inv => (
                     <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors group">
                       <td className="px-6 py-5 font-bold text-sm text-gray-900">{inv.id}</td>
                       <td className="px-6 py-5 text-sm text-gray-600">{inv.tenantName}</td>
                       <td className="px-6 py-5 text-sm font-bold text-gray-900">${inv.amount.toLocaleString()}</td>
                       <td className="px-6 py-5">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            inv.status === 'Paid' ? 'bg-green-50 text-green-600' : 
                            inv.status === 'Unpaid' ? 'bg-gray-50 text-gray-600' : 
                            'bg-red-50 text-red-600'
                          }`}>
                            {inv.status}
                          </span>
                       </td>
                       <td className="px-6 py-5 text-right">
                          <button 
                            onClick={() => confirmDelete(inv.id)}
                            className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This will remove it from financial records."
      />
    </div>
  );
};
