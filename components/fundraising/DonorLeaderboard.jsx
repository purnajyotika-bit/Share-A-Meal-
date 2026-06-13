import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Trophy, Medal } from 'lucide-react';

function getBadge(rank, total) {
  if (rank === 0) return { icon: '🥇', label: 'Gold Champion', color: 'text-yellow-600' };
  if (rank === 1) return { icon: '🥈', label: 'Silver Hero', color: 'text-slate-500' };
  if (rank === 2) return { icon: '🥉', label: 'Bronze Star', color: 'text-amber-700' };
  if (total > 5000) return { icon: '💎', label: 'Diamond Donor', color: 'text-blue-600' };
  if (total > 1000) return { icon: '⭐', label: 'Star Donor', color: 'text-primary' };
  return { icon: '🤝', label: 'Supporter', color: 'text-muted-foreground' };
}

export default function DonorLeaderboard() {
  const { data: donations = [] } = useQuery({
    queryKey: ['campaign-donations-leaderboard'],
    queryFn: () => base44.entities.CampaignDonation.list('-created_date', 200),
  });

  // Aggregate by donor
  const byDonor = {};
  donations.forEach(d => {
    if (d.anonymous) return;
    const key = d.donor_email;
    if (!byDonor[key]) byDonor[key] = { name: d.donor_name, total: 0, count: 0 };
    byDonor[key].total += d.amount;
    byDonor[key].count += 1;
  });

  const sorted = Object.values(byDonor).sort((a, b) => b.total - a.total).slice(0, 10);

  return (
    <div className="bg-card border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-amber-500" />
        <h3 className="font-semibold text-foreground">Donor Leaderboard</h3>
      </div>
      {sorted.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-4">No donations yet — be the first!</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((donor, i) => {
            const badge = getBadge(i, donor.total);
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xl w-8 text-center">{badge.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{donor.name}</p>
                  <p className={`text-xs ${badge.color}`}>{badge.label} · {donor.count} donation{donor.count !== 1 ? 's' : ''}</p>
                </div>
                <span className="font-bold text-sm text-foreground">₹{donor.total.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
