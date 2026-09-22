import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  Boxes,
  Plus,
  Search,
  RotateCcw,
  Eye,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Pill,
  Calendar,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  TrendingDown,
  Building2,
  FileText,
  X
} from 'lucide-react';

export default function Inventory() {
  const { showToast, user } = useContext(AuthContext);

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [stockStatus, setStockStatus] = useState('ALL');
  const [expiryStatus, setExpiryStatus] = useState('ALL');

  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Add Medicine Form State
  const [addForm, setAddForm] = useState({
    genericName: '',
    brandName: '',
    category: 'Analgesic',
    dosage: '500mg',
    form: 'Tablet',
    unit: 'Tablets',
    minStockLevel: 50,
    description: '',
    batchNumber: '',
    quantity: '',
    dateReceived: new Date().toISOString().split('T')[0],
    expirationDate: '',
    supplier: 'DOH Central Supply',
    unitCost: '0.00'
  });

  const categories = [
    'Analgesic',
    'Antibiotic',
    'Antihistamine',
    'Antihypertensive',
    'Antidiabetic',
    'Electrolytes',
    'Vitamins / Maternal',
    'Bronchodilator',
    'NSAID'
  ];

  // Fetch medicines list with filters
  const fetchInventory = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.append('search', search.trim());
    if (category !== 'ALL') params.append('category', category);
    if (stockStatus !== 'ALL') params.append('stockStatus', stockStatus);
    if (expiryStatus !== 'ALL') params.append('expiryStatus', expiryStatus);

    api.get(`/medicines?${params.toString()}`)
      .then((res) => setMedicines(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInventory();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, category, stockStatus, expiryStatus]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearch('');
    setCategory('ALL');
    setStockStatus('ALL');
    setExpiryStatus('ALL');
  };

  // Open "View Medicine Details" modal
  const handleOpenDetails = (medId) => {
    setDetailsLoading(true);
    setShowDetailsModal(true);
    api.get(`/medicines/${medId}/details`)
      .then((res) => setSelectedDetails(res.data.data))
      .catch((err) => {
        if (showToast) showToast('Could not load batch history.', 'error');
      })
      .finally(() => setDetailsLoading(false));
  };

  // Submit "Add Medicine"
  const handleSaveMedicine = async (e) => {
    e.preventDefault();
    try {
      await api.post('/medicines', addForm);
      if (showToast) showToast('Medicine & initial batch registered successfully!', 'success');
      setShowAddModal(false);
      setAddForm({
        genericName: '',
        brandName: '',
        category: 'Analgesic',
        dosage: '500mg',
        form: 'Tablet',
        unit: 'Tablets',
        minStockLevel: 50,
        description: '',
        batchNumber: '',
        quantity: '',
        dateReceived: new Date().toISOString().split('T')[0],
        expirationDate: '',
        supplier: 'DOH Central Supply',
        unitCost: '0.00'
      });
      fetchInventory();
    } catch (err) {
      if (showToast) showToast(err.response?.data?.message || 'Error saving medicine.', 'error');
    }
  };

  // Summary Metrics calculations
  const totalMedicinesCount = medicines.length;
  const lowStockCount = medicines.filter((m) => m.computed_status === 'LOW_STOCK').length;
  const expiringSoonCount = medicines.filter((m) => m.computed_status === 'EXPIRING_SOON').length;
  const outOfStockCount = medicines.filter((m) => m.computed_status === 'OUT_OF_STOCK').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 2. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Medicine Inventory</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#064e3b] text-white">
              FIFO Protocol
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Manage medicine stocks, batches, and expiry dates.</p>
        </div>

        {/* User profile info in header */}
        <div className="flex items-center gap-3 self-start sm:self-auto bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200/60">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#064e3b] font-black text-xs flex items-center justify-center">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-tight">{user?.fullName || 'Staff User'}</p>
            <p className="text-[10px] text-emerald-700 font-semibold">{user?.role || 'BHW'}</p>
          </div>
        </div>
      </div>

      {/* 3. SUMMARY CARDS (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Medicines */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Medicines</p>
            <h3 className="text-2xl font-black text-slate-900">{totalMedicinesCount}</h3>
            <p className="text-[11px] text-slate-500">Active formulary items</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Pill className="w-5 h-5" />
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-500">Low Stock</p>
            <h3 className="text-2xl font-black text-amber-600">{lowStockCount}</h3>
            <p className="text-[11px] text-slate-500">Below minimum buffer</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-orange-500">Expiring Soon</p>
            <h3 className="text-2xl font-black text-orange-600">{expiringSoonCount}</h3>
            <p className="text-[11px] text-slate-500">Within 60 days</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-rose-500">Out of Stock</p>
            <h3 className="text-2xl font-black text-rose-600">{outOfStockCount}</h3>
            <p className="text-[11px] text-slate-500">Zero inventory remaining</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4. SEARCH AND FILTERS BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search bar */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search medicine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#064e3b] text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-[#064e3b] cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Stock Status Dropdown */}
          <select
            value={stockStatus}
            onChange={(e) => setStockStatus(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-[#064e3b] cursor-pointer"
          >
            <option value="ALL">All Stock Statuses</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>

          {/* Expiry Status Dropdown */}
          <select
            value={expiryStatus}
            onChange={(e) => setExpiryStatus(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-[#064e3b] cursor-pointer"
          >
            <option value="ALL">All Expiry Statuses</option>
            <option value="EXPIRING_SOON">Expiring Soon (≤ 60 days)</option>
            <option value="EXPIRED">Expired Stock</option>
          </select>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-700 font-bold transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#064e3b] hover:bg-[#04382a] text-white font-bold rounded-2xl shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* 5. MEDICINE TABLE (UNCLUTTERED, EASY TO READ) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-4">Medicine Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">
                  <span>Batch No. </span>
                  <span className="text-emerald-700 text-[9px] font-extrabold">(FIFO Next)</span>
                </th>
                <th className="p-4 text-center">Current Stock</th>
                <th className="p-4">Unit</th>
                <th className="p-4">Expiry Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-10 text-center text-slate-400 font-medium">Loading inventory data...</td>
                </tr>
              ) : medicines.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-10 text-center text-slate-400 font-medium">No medicines match the selected filter criteria.</td>
                </tr>
              ) : (
                medicines.map((m) => {
                  // Badge styling logic
                  const statusColors = {
                    IN_STOCK: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    LOW_STOCK: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                    EXPIRING_SOON: 'bg-orange-50 text-orange-700 border-orange-200',
                    OUT_OF_STOCK: 'bg-rose-50 text-rose-700 border-rose-200'
                  };

                  const statusLabels = {
                    IN_STOCK: 'In Stock',
                    LOW_STOCK: 'Low Stock',
                    EXPIRING_SOON: 'Expiring Soon',
                    OUT_OF_STOCK: 'Out of Stock'
                  };

                  const formattedExpiry = m.earliest_expiry_date
                    ? new Date(m.earliest_expiry_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                    : 'None';

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition">
                      {/* Medicine Name */}
                      <td className="p-4">
                        <p className="font-bold text-slate-900 text-xs">{m.generic_name} {m.dosage}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {m.brand_name ? `${m.brand_name} • ` : ''}{m.item_code}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="p-4 text-slate-600 font-medium">{m.category}</td>

                      {/* Batch No (Next to Release via FIFO) */}
                      <td className="p-4">
                        {m.next_batch_number ? (
                          <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg text-[11px] border border-slate-200/70">
                            {m.next_batch_number}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">No active batch</span>
                        )}
                      </td>

                      {/* Current Stock */}
                      <td className="p-4 text-center">
                        <span className={`text-sm font-black ${m.total_stock === 0 ? 'text-rose-600' : m.total_stock <= m.min_stock_level ? 'text-amber-600' : 'text-slate-900'}`}>
                          {m.total_stock}
                        </span>
                      </td>

                      {/* Unit */}
                      <td className="p-4 text-slate-500 font-medium">{m.unit}</td>

                      {/* Expiry Date */}
                      <td className="p-4 text-slate-600 font-medium">{formattedExpiry}</td>

                      {/* Status Badge */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${statusColors[m.computed_status] || statusColors.IN_STOCK}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          <span>{statusLabels[m.computed_status]}</span>
                        </span>
                      </td>

                      {/* 6. ACTIONS (View, Details) */}
                      <td className="p-4 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenDetails(m.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-[#064e3b] hover:text-white text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6 & 7. VIEW MEDICINE DETAILS MODAL (WITH FIFO BATCHES & STOCK HISTORY) */}
      {showDetailsModal && (
        <div className="fixed inset-0 top-0 left-0 w-screen h-screen bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 text-[#064e3b] rounded-2xl flex items-center justify-center font-bold">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {selectedDetails?.medicine?.generic_name} {selectedDetails?.medicine?.dosage}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedDetails?.medicine?.brand_name ? `${selectedDetails.medicine.brand_name} • ` : ''}
                    Category: {selectedDetails?.medicine?.category} • Code: {selectedDetails?.medicine?.item_code}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedDetails(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {detailsLoading || !selectedDetails ? (
              <div className="py-12 text-center text-xs font-semibold text-slate-400">Loading batch details & FIFO movements...</div>
            ) : (
              <>
                {/* 7. FIFO INDICATOR BANNER */}
                <div className="p-4 bg-emerald-50 border border-emerald-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#064e3b] text-white flex items-center justify-center font-black text-sm">
                      FIFO
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Next to Release</p>
                      <p className="text-sm font-black text-slate-900">
                        {selectedDetails.nextToReleaseBatch
                          ? `Batch: ${selectedDetails.nextToReleaseBatch.batch_number}`
                          : 'No valid non-expired batch available'}
                      </p>
                    </div>
                  </div>
                  {selectedDetails.nextToReleaseBatch && (
                    <div className="text-xs text-emerald-800 font-semibold bg-emerald-100/80 px-3 py-1.5 rounded-xl border border-emerald-200">
                      Expires: {new Date(selectedDetails.nextToReleaseBatch.expiration_date).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Medicine Stats Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Unit Type</span>
                    <span className="font-bold text-slate-800">{selectedDetails.medicine.unit} ({selectedDetails.medicine.form})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Min Stock Level</span>
                    <span className="font-bold text-slate-800">{selectedDetails.medicine.min_stock_level} {selectedDetails.medicine.unit}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Usable Stock</span>
                    <span className="font-black text-emerald-800 text-sm">
                      {selectedDetails.batches.filter(b => b.batch_status !== 'EXPIRED').reduce((acc, curr) => acc + curr.current_quantity, 0)} {selectedDetails.medicine.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Total Active Batches</span>
                    <span className="font-bold text-slate-800">{selectedDetails.batches.length} batch(es)</span>
                  </div>
                </div>

                {/* BATCH INFORMATION LIST (FIFO SORTED) */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-700" />
                    <span>Batch Inventory (Sorted by Earliest Expiry First)</span>
                  </h4>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase border-b border-slate-200">
                        <tr>
                          <th className="p-3">Batch Number</th>
                          <th className="p-3">Quantity</th>
                          <th className="p-3">Date Received</th>
                          <th className="p-3">Expiry Date</th>
                          <th className="p-3">Supplier</th>
                          <th className="p-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {selectedDetails.batches.length === 0 ? (
                          <tr><td colSpan="6" className="p-6 text-center text-slate-400">No batches recorded for this medicine.</td></tr>
                        ) : (
                          selectedDetails.batches.map((b) => (
                            <tr key={b.id} className="hover:bg-slate-50">
                              <td className="p-3 font-mono font-bold text-slate-900">{b.batch_number}</td>
                              <td className="p-3 font-black text-slate-800">{b.current_quantity} / {b.quantity_received}</td>
                              <td className="p-3 text-slate-500">{new Date(b.date_received).toLocaleDateString()}</td>
                              <td className="p-3 font-semibold text-slate-800">{new Date(b.expiration_date).toLocaleDateString()}</td>
                              <td className="p-3 text-slate-500">{b.supplier || 'DOH Central'}</td>
                              <td className="p-3 text-right">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  b.batch_status === 'EXPIRED'
                                    ? 'bg-rose-100 text-rose-700'
                                    : b.batch_status === 'NEAR_EXPIRY'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                  {b.batch_status === 'EXPIRED' ? 'Expired' : b.batch_status === 'NEAR_EXPIRY' ? 'Near Expiry' : 'Valid'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* STOCK MOVEMENT HISTORY */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <HistoryIcon className="w-4 h-4 text-blue-600" />
                    <span>Recent Stock Movement History</span>
                  </h4>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Date / Time</th>
                          <th className="p-2.5">Movement Type</th>
                          <th className="p-2.5">Batch</th>
                          <th className="p-2.5">Quantity</th>
                          <th className="p-2.5">Balance After</th>
                          <th className="p-2.5">Staff In-Charge</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px] text-slate-600 font-medium">
                        {selectedDetails.history.length === 0 ? (
                          <tr><td colSpan="6" className="p-4 text-center text-slate-400">No recent movement transactions.</td></tr>
                        ) : (
                          selectedDetails.history.map((h) => (
                            <tr key={h.id}>
                              <td className="p-2.5 text-slate-400 font-mono">{new Date(h.created_at).toLocaleString()}</td>
                              <td className="p-2.5 font-bold">
                                {h.transaction_type === 'DISPENSE' ? (
                                  <span className="text-rose-600 flex items-center gap-1">
                                    <ArrowDownRight className="w-3.5 h-3.5" /> Dispensed
                                  </span>
                                ) : (
                                  <span className="text-emerald-700 flex items-center gap-1">
                                    <ArrowUpRight className="w-3.5 h-3.5" /> Received
                                  </span>
                                )}
                              </td>
                              <td className="p-2.5 font-mono">{h.batch_number}</td>
                              <td className="p-2.5 font-bold text-slate-900">{h.quantity} units</td>
                              <td className="p-2.5 font-bold text-slate-800">{h.balance_after}</td>
                              <td className="p-2.5 text-slate-500">{h.performed_by_name}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDetailsModal(false)}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs cursor-pointer"
                  >
                    Close Details
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 8. ADD MEDICINE MODAL (FORMULARY MASTER + INITIAL BATCH) */}
      {showAddModal && (
        <div className="fixed inset-0 top-0 left-0 w-screen h-screen bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-emerald-100 text-[#064e3b] rounded-2xl flex items-center justify-center font-bold">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Add Medicine to Inventory</h3>
                  <p className="text-xs text-slate-400">Register master medicine specifications & initial delivery batch</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMedicine} className="space-y-4 text-xs">
              
              {/* SECTION 1: MEDICINE SPECIFICATIONS */}
              <div className="space-y-2.5">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  1. Medicine Master Information
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Generic Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Paracetamol, Amoxicillin"
                      value={addForm.genericName}
                      onChange={(e) => setAddForm({ ...addForm, genericName: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#064e3b] font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Brand Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Biogesic, Amoxil"
                      value={addForm.brandName}
                      onChange={(e) => setAddForm({ ...addForm, brandName: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#064e3b] font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category *</label>
                    <select
                      value={addForm.category}
                      onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl font-bold bg-white focus:ring-2 focus:ring-[#064e3b]"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Dosage *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. 500mg, 10mg, 2mg/5mL"
                      value={addForm.dosage}
                      onChange={(e) => setAddForm({ ...addForm, dosage: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#064e3b] font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Unit of Measure *</label>
                    <select
                      value={addForm.unit}
                      onChange={(e) => setAddForm({ ...addForm, unit: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl font-bold bg-white focus:ring-2 focus:ring-[#064e3b]"
                    >
                      <option value="Tablets">Tablets</option>
                      <option value="Capsules">Capsules</option>
                      <option value="Bottles">Bottles</option>
                      <option value="Sachets">Sachets</option>
                      <option value="Ampules">Ampules</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Minimum Buffer Stock Level *</label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={addForm.minStockLevel}
                      onChange={(e) => setAddForm({ ...addForm, minStockLevel: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-amber-700 focus:ring-2 focus:ring-[#064e3b]"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Triggers low stock alert when balance falls below this number.</p>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Description / Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. For fever, headache, body pain"
                      value={addForm.description}
                      onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#064e3b]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: INITIAL BATCH SPECIFICATIONS */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                    2. Initial Delivery Batch (Optional)
                  </p>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    FIFO Intake
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Batch Number</label>
                    <input
                      type="text"
                      placeholder="e.g. PCM-001 or LOT-2026"
                      value={addForm.batchNumber}
                      onChange={(e) => setAddForm({ ...addForm, batchNumber: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-800 focus:ring-2 focus:ring-[#064e3b]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Quantity Received</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 100"
                      value={addForm.quantity}
                      onChange={(e) => setAddForm({ ...addForm, quantity: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#064e3b]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Date Received</label>
                    <input
                      type="date"
                      value={addForm.dateReceived}
                      onChange={(e) => setAddForm({ ...addForm, dateReceived: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#064e3b]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Expiration Date (FIFO Priority)</label>
                    <input
                      type="date"
                      value={addForm.expirationDate}
                      onChange={(e) => setAddForm({ ...addForm, expirationDate: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#064e3b]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Supplier / Funding Program</label>
                  <input
                    type="text"
                    placeholder="e.g. DOH Central Supply, Municipal LGU, Rotary Donation"
                    value={addForm.supplier}
                    onChange={(e) => setAddForm({ ...addForm, supplier: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#064e3b]"
                  />
                </div>
              </div>

              {/* MODAL ACTIONS */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#064e3b] hover:bg-[#04382a] text-white font-bold rounded-xl shadow-lg transition cursor-pointer"
                >
                  Save Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Small inline icon helper for history
function HistoryIcon({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
      <path d="M12 7v5l4 2"/>
    </svg>
  );
}