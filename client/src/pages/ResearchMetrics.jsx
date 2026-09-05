import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Activity, Clock, Percent, Award, Send } from 'lucide-react';

export default function ResearchMetrics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ISO 25010 Usability Evaluation Form
  const [evalForm, setEvalForm] = useState({
    functionalSuitability: 5,
    performanceEfficiency: 5,
    usability: 5,
    reliability: 5,
    securityRating: 5,
    overallSatisfaction: 5,
    feedback: '',
  });

  const loadData = () => {
    setLoading(true);
    api.get('/research/metrics')
      .then((res) => setData(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    try {
      await api.post('/research/evaluation', evalForm);
      alert('ISO 25010 Usability rating recorded successfully!');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting response.');
    }
  };

  if (loading || !data) return <div className="p-8 text-center text-xs text-slate-400">Loading research statistics...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Quantitative Research Component</h2>
        <p className="text-xs text-slate-500">Empirical measurement of transaction turnaround time, discrepancy rate, and software quality</p>
      </div>

      {/* RESEARCH CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pre vs Post Transaction Turnaround Time */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Patient Processing Time</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="pt-2">
            <div className="text-xs text-slate-500">Manual (Pre-Implementation):</div>
            <div className="text-lg font-bold text-slate-800">{data.preStats.mean} mins <span className="text-xs text-slate-400 font-normal">(±{data.preStats.stdDev})</span></div>
          </div>
          <div className="pt-2 border-t border-slate-100">
            <div className="text-xs text-emerald-600 font-semibold">Automated MediTrack (Post):</div>
            <div className="text-2xl font-bold text-emerald-700">{data.postStats.mean} mins <span className="text-xs text-slate-400 font-normal">(±{data.postStats.stdDev})</span></div>
          </div>
          <p className="text-[11px] text-slate-400 pt-1">Benchmark basis for Paired Samples T-Test (α = 0.05)</p>
        </div>

        {/* Inventory Discrepancy Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Discrepancy Rate</span>
            <Percent className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900 pt-4">{data.averageDiscrepancyRate}%</h3>
          <p className="text-xs text-slate-500">Formula: |System - Physical| / System × 100</p>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">Total Counts Recorded: {data.totalCounts}</div>
        </div>

        {/* Usability Rating */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">ISO 25010 Usability</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="text-3xl font-bold text-emerald-700 pt-4">{data.evalSummary?.avgOverall || '5.00'} / 5.0</h3>
          <p className="text-xs text-slate-500">5-point Likert Scale mean score</p>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">Evaluators: {data.evalSummary?.totalRespondents || 0} users</div>
        </div>
      </div>

      {/* ISO 25010 USABILITY SURVEY FORM */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-xl">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Submit ISO 25010 Software Quality Rating</h3>
        <p className="text-xs text-slate-400 mb-4">Rate the MediTrack system from 1 (Strongly Disagree) to 5 (Strongly Agree)</p>

        <form onSubmit={handleSubmitEvaluation} className="space-y-3 text-xs">
          {[
            { key: 'functionalSuitability', label: 'Functional Suitability (Completeness of health clinic functions)' },
            { key: 'performanceEfficiency', label: 'Performance Efficiency (Fast patient retrieval & FIFO response)' },
            { key: 'usability', label: 'Usability (Easy to learn and operate for BHW staff)' },
            { key: 'reliability', label: 'Reliability (Accuracy of inventory and medical records)' },
            { key: 'securityRating', label: 'Security & Access Control (Role protections and audit trails)' },
            { key: 'overallSatisfaction', label: 'Overall Satisfaction with MediTrack' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between border-b border-slate-50 pb-2">
              <span className="text-slate-700 font-medium">{item.label}</span>
              <select
                value={evalForm[item.key]}
                onChange={(e) => setEvalForm({ ...evalForm, [item.key]: parseInt(e.target.value) })}
                className="p-1 border border-slate-300 rounded font-bold text-emerald-700"
              >
                <option value="5">5 - Strongly Agree</option>
                <option value="4">4 - Agree</option>
                <option value="3">3 - Neutral</option>
                <option value="2">2 - Disagree</option>
                <option value="1">1 - Strongly Disagree</option>
              </select>
            </div>
          ))}

          <div className="pt-2">
            <label className="block font-semibold text-slate-700 mb-1">User Qualitative Feedback</label>
            <textarea
              rows="2"
              value={evalForm.feedback}
              onChange={(e) => setEvalForm({ ...evalForm, feedback: e.target.value })}
              placeholder="Your observations regarding usability and workflow improvement..."
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Usability Evaluation</span>
          </button>
        </form>
      </div>
    </div>
  );
}