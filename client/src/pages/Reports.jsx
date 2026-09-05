import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Printer, Download } from 'lucide-react';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('demographics');
  const [demoData, setDemoData] = useState(null);
  const [morbidityData, setMorbidityData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);

  useEffect(() => {
    api.get('/reports/demographics').then((res) => setDemoData(res.data.data));
    api.get('/reports/morbidity').then((res) => setMorbidityData(res.data.data));
    api.get('/reports/inventory').then((res) => setInventoryData(res.data.data));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Barangay Health Center Reports</h2>
          <p className="text-xs text-slate-500">Official monthly summaries for local health officers and DOH monitoring</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* REPORT TABS */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('demographics')}
          className={`pb-2.5 border-b-2 ${activeTab === 'demographics' ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-transparent text-slate-500'}`}
        >
          Demographic Summary
        </button>
        <button
          onClick={() => setActiveTab('morbidity')}
          className={`pb-2.5 border-b-2 ${activeTab === 'morbidity' ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-transparent text-slate-500'}`}
        >
          Morbidity Report (Diagnoses)
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-2.5 border-b-2 ${activeTab === 'inventory' ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-transparent text-slate-500'}`}
        >
          Medicine Inventory Audit
        </button>
      </div>

      {/* TAB 1: DEMOGRAPHICS */}
      {activeTab === 'demographics' && demoData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Population By Age Bracket</h3>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                <tr>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5 text-right">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {demoData.byAge.map((item, i) => (
                  <tr key={i}>
                    <td className="p-2.5 text-slate-700 font-medium">{item.age_bracket}</td>
                    <td className="p-2.5 text-right font-bold text-slate-900">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Population By Sex</h3>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                <tr>
                  <th className="p-2.5">Sex</th>
                  <th className="p-2.5 text-right">Count</th>
                  <th className="p-2.5 text-right">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {demoData.bySex.map((item, i) => (
                  <tr key={i}>
                    <td className="p-2.5 text-slate-700 font-medium">{item.sex}</td>
                    <td className="p-2.5 text-right font-bold text-slate-900">{item.count}</td>
                    <td className="p-2.5 text-right text-emerald-700 font-semibold">{item.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MORBIDITY */}
      {activeTab === 'morbidity' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Disease / Diagnosis</th>
                <th className="p-3 text-right">Recorded Cases</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {morbidityData.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-400">#{idx + 1}</td>
                  <td className="p-3 font-semibold text-slate-800">{m.diagnosis}</td>
                  <td className="p-3 text-right font-bold text-emerald-700">{m.total_cases} cases</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: INVENTORY AUDIT */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3">Generic Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Usable Stock</th>
                <th className="p-3">Near Expiry (&lt;30d)</th>
                <th className="p-3">Expired Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventoryData.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-semibold text-slate-600">{inv.item_code}</td>
                  <td className="p-3 font-bold text-slate-800">{inv.generic_name} ({inv.dosage})</td>
                  <td className="p-3 text-slate-600">{inv.category}</td>
                  <td className="p-3 font-bold text-slate-900">{inv.usable_stock}</td>
                  <td className="p-3 font-semibold text-blue-600">{inv.near_expiry_stock}</td>
                  <td className="p-3 font-semibold text-rose-600">{inv.expired_stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}