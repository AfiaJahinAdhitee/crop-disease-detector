'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SignOutButton from '../components/SignOutButton'; 

export default function DashboardPage() {
  const [rawAnalytics, setRawAnalytics] = useState([]); 
  const [chartData, setChartData] = useState([]);       
  const [selectedCrop, setSelectedCrop] = useState('all'); 
  const [recentActivity, setRecentActivity] = useState([]); // রিসেন্ট অ্যাক্টিভিটি স্টেট
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);

  const formatAndSetChartData = (data, cropFilter) => {
    let filtered = data;
    if (cropFilter !== 'all') {
      filtered = data.filter(item => item.crop === cropFilter);
    }
    const formatted = filtered.map(item => ({
      name: cropFilter === 'all' ? `${item.region} (${item.crop})` : item.region,
      'আক্রান্তের সংখ্যা': item.count
    }));
    setChartData(formatted);
  };

  useEffect(() => {
    // ১. চার্টের জন্য অ্যানালিটিক্স ডেটা আনা
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/dashboard/analytics');
        const data = await res.json();
        setRawAnalytics(data);
        formatAndSetChartData(data, 'all');
        setLoadingChart(false);
      } catch (error) {
        console.error("Error fetching chart data:", error);
        setLoadingChart(false);
      }
    }

    // ২. রিসেন্ট অ্যাক্টিভিটি ডেটা আনা
    async function fetchRecentActivity() {
      try {
        const res = await fetch('/api/dashboard/recent');
        const data = await res.json();
        setRecentActivity(data);
        setLoadingRecent(false);
      } catch (error) {
        console.error("Error fetching recent activity:", error);
        setLoadingRecent(false);
      }
    }

    fetchAnalytics();
    fetchRecentActivity();
  }, []);

  const handleCropChange = (e) => {
    const crop = e.target.value;
    setSelectedCrop(crop);
    formatAndSetChartData(rawAnalytics, crop);
  };

  const availableCrops = Array.from(new Set(rawAnalytics.map(item => item.crop)));

  // Severity (তীব্রতা) অনুযায়ী কালার ডিফাইন করার হেল্পার ফাংশন
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'text-red-400 bg-red-950/50 border-red-900';
      case 'medium': return 'text-yellow-400 bg-yellow-950/50 border-yellow-900';
      default: return 'text-green-400 bg-green-950/50 border-green-900';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6 py-12">
      <main className="w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/95 p-10 shadow-2xl shadow-slate-950/40">
        
        {/* হেডার */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-green-400">Crop Disease Detector</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Dashboard</h1>
            <p className="mt-4 text-slate-400">Central hub for crop health information and real-time analytics.</p>
          </div>
          <div className="mt-2">
            <SignOutButton />
          </div>
        </div>

        {/* 📊 চার্ট সেকশন */}
        <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h2 className="text-xl font-semibold text-white">Regional Disease Analytics</h2>
            {!loadingChart && rawAnalytics.length > 0 && (
              <div className="flex items-center gap-2">
                <select value={selectedCrop} onChange={handleCropChange} className="bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:border-green-500">
                  <option value="all">All Crops</option>
                  {availableCrops.map(crop => <option key={crop} value={crop}>{crop}</option>)}
                </select>
              </div>
            )}
          </div>
          {loadingChart ? (
            <p className="text-slate-500 text-sm animate-pulse">Loading analytics...</p>
          ) : chartData.length === 0 ? (
            <p className="text-slate-500 text-sm">No data available.</p>
          ) : (
            <div className="w-full h-[300px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} itemStyle={{ color: '#4ade80' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="আক্রান্তের সংখ্যা" fill="#4ade80" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 🕒 লাইভ অ্যাক্টিভিটি কার্ডসমূহ */}
        <div className="mt-6 space-y-4 rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
          
          {loadingRecent ? (
            <p className="text-slate-500 text-sm animate-pulse">Loading recent history...</p>
          ) : recentActivity.length === 0 ? (
            <div className="rounded-2xl bg-slate-900 p-6">
              <p className="text-slate-400">No activity yet. Upload a leaf photo to generate your first diagnosis.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <h3 className="font-medium text-white">{activity.crop_type} — <span className="text-green-400">{activity.disease_name || 'Checking...'}</span></h3>
                    <p className="text-xs text-slate-400 mt-1">Region: {activity.region} | Date: {new Date(activity.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full border ${getSeverityColor(activity.severity)}`}>
                    {activity.severity || 'Normal'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* বাটনসমূহ */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="inline-flex items-center justify-center rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500">
            Back to Home
          </Link>
        </div>

      </main>
    </div>
  );
}