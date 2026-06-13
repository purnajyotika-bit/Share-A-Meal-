import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, Users, Utensils, Leaf, DollarSign, Package, Bot } from 'lucide-react';
import KPICard from '@/components/analytics/KPICard';
import AIChatInsight from '@/components/analytics/AIChatInsight';

const COLORS = ['#e8622a', '#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#ec4899'];

const STATUS_LABELS = { available: 'Available', claimed: 'Claimed', picked_up: 'Picked Up', delivered: 'Delivered', expired: 'Expired' };
const CAT_LABELS = { cooked_meals: 'Cooked Meals', raw_ingredients: 'Raw Ingredients', packaged_food: 'Packaged Food', baked_goods: 'Baked Goods', beverages: 'Beverages', other: 'Other' };

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key] || 'unknown';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

function getLast7Days(donations) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('en', { weekday: 'short' });
    const count = donations.filter(don => {
      const donDate = new Date(don.created_date);
      return donDate.toDateString() === d.toDateString();
    }).length;
    days.push({ day: label, donations: count });
  }
  return days;
}

export default function Analytics() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [period, setPeriod] = useState('weekly');
  const [showAI, setShowAI] = useState(false);

  const { data: donations = [], isLoading: loadingDonations } = useQuery({
    queryKey: ['analytics-donations'],
    queryFn: () => base44.entities.Donation.list('-created_date', 500),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['analytics-users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['analytics-campaigns'],
    queryFn: () => base44.entities.Campaign.list(),
  });

  const delivered = donations.filter(d => d.status === 'delivered');
  const activeVolunteers = users.filter(u => u.role === 'volunteer').length;
  const fundsRaised = campaigns.reduce((s, c) => s + (c.raised_amount || 0), 0);
  const co2Saved = delivered.length * 2.5; // ~2.5kg CO2 per meal saved estimate

  const statusData = Object.entries(groupBy(donations, 'status')).map(([name, value]) => ({
    name: STATUS_LABELS[name] || name, value
  }));

  const categoryData = Object.entries(groupBy(donations, 'category')).map(([name, value]) => ({
    name: CAT_LABELS[name] || name, value
  }));

  const trendData = getLast7Days(donations);

  const volunteerData = users
    .filter(u => u.role === 'volunteer')
    .map(u => ({
      name: u.full_name?.split(' ')[0] || 'User',
      deliveries: donations.filter(d => d.volunteer_email === u.email && d.status === 'delivered').length,
    }))
    .filter(v => v.deliveries > 0)
    .sort((a, b) => b.deliveries - a.deliveries)
    .slice(0, 8);

  if (loadingDonations) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('analytics')}</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time insights on food rescue operations</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-muted rounded-lg p-1">
            {['daily', 'weekly', 'monthly'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors capitalize ${period === p ? 'bg-white shadow text-foreground' : 'text-muted-foreground'}`}>
                {p}
              </button>
            ))}
          </div>
          <Button variant="outline" className="gap-2" onClick={() => setShowAI(!showAI)}>
            <Bot className="w-4 h-4" />AI Insights
          </Button>
        </div>
      </div>

      {/* AI Chat */}
      {showAI && (
        <div className="mb-8">
          <AIChatInsight donations={donations} users={users} campaigns={campaigns} />
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <KPICard icon={Utensils} label={t('total_food_saved')} value={donations.length} color="text-primary" bg="bg-primary/10" />
        <KPICard icon={Package} label={t('meals_served')} value={delivered.length} color="text-green-600" bg="bg-green-50" />
        <KPICard icon={Users} label={t('active_volunteers')} value={activeVolunteers} color="text-blue-600" bg="bg-blue-50" />
        <KPICard icon={Leaf} label={t('co2_reduced')} value={`${co2Saved.toFixed(0)}kg`} color="text-emerald-600" bg="bg-emerald-50" />
        <KPICard icon={DollarSign} label={t('funds_raised')} value={`₹${fundsRaised.toLocaleString()}`} color="text-purple-600" bg="bg-purple-50" />
      </div>

      {/* Charts grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Donation trend */}
        <div className="bg-card border rounded-2xl p-5">
          <h3 className="font-semibold text-foreground mb-4">📈 Daily Donation Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="donations" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category distribution */}
        <div className="bg-card border rounded-2xl p-5">
          <h3 className="font-semibold text-foreground mb-4">🍱 Food Category Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Status breakdown */}
        <div className="bg-card border rounded-2xl p-5">
          <h3 className="font-semibold text-foreground mb-4">📦 Donation Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Volunteer performance */}
        <div className="bg-card border rounded-2xl p-5">
          <h3 className="font-semibold text-foreground mb-4">🤝 Volunteer Delivery Performance</h3>
          {volunteerData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No volunteer data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={volunteerData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="deliveries" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Hunger + CO2 impact */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { emoji: '🌍', title: 'CO₂ Emissions Prevented', desc: `Saving ${donations.length} food items prevented ~${co2Saved.toFixed(0)}kg of CO₂ — equivalent to planting ${Math.round(co2Saved / 21)} trees.`, color: 'from-green-50 to-emerald-50 border-green-200' },
          { emoji: '🍽️', title: 'Hunger Impact', desc: `${delivered.length} meals delivered directly to those in need. Each delivery feeds an average of 3 people.`, color: 'from-orange-50 to-amber-50 border-orange-200' },
          { emoji: '📊', title: 'Waste Reduction Rate', desc: `${donations.length > 0 ? ((delivered.length / donations.length) * 100).toFixed(1) : 0}% of posted donations successfully reached beneficiaries.`, color: 'from-blue-50 to-indigo-50 border-blue-200' },
        ].map(card => (
          <div key={card.title} className={`bg-gradient-to-br ${card.color} border rounded-2xl p-5`}>
            <div className="text-3xl mb-2">{card.emoji}</div>
            <h3 className="font-semibold text-foreground mb-1 text-sm">{card.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
