import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ShieldCheck, Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';
import QRCodeDisplay from '@/components/delivery/QRCodeDisplay';

export default function DeliveryHandoff() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const donationId = window.location.pathname.split('/delivery/')[1];
  const [verifyCode, setVerifyCode] = useState('');

  const { data: donation, isLoading } = useQuery({
    queryKey: ['donation-detail', donationId],
    queryFn: async () => {
      const all = await base44.entities.Donation.list();
      return all.find(d => d.id === donationId) || null;
    },
    enabled: !!donationId,
  });

  const verifyMutation = useMutation({
    mutationFn: async () => {
      if (verifyCode.trim().toUpperCase() !== donation?.qr_code?.toUpperCase()) {
        throw new Error('Invalid verification code');
      }
      await base44.entities.Donation.update(donation.id, {
        status: 'delivered',
        verified_at: new Date().toISOString(),
      });
      // Notify all parties
      const toNotify = [
        donation.donor_email && { email: donation.donor_email, title: 'Delivery verified! ✅', msg: `"${donation.title}" was delivered and verified` },
        donation.claimed_by && { email: donation.claimed_by, title: 'Food received! ✅', msg: `"${donation.title}" delivery confirmed` },
        donation.volunteer_email && { email: donation.volunteer_email, title: 'Delivery complete! 🎉', msg: `You delivered "${donation.title}" successfully` },
      ].filter(Boolean);
      await Promise.all(toNotify.map(n => base44.entities.Notification.create({
        user_email: n.email, title: n.title, message: n.msg, type: 'qr_verified', donation_id: donation.id,
      })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donation-detail'] });
      toast.success('Delivery verified!');
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;

  if (!donation) return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h2 className="font-semibold">Donation not found</h2>
    </div>
  );

  const isVolunteer = user?.email === donation.volunteer_email;
  const isReceiver = user?.email === donation.claimed_by;
  const isDelivered = donation.status === 'delivered';

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">Delivery Handoff</h1>

      {/* Donation summary */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-semibold">{donation.title}</h2>
              <p className="text-sm text-muted-foreground">{donation.quantity} · {donation.pickup_address}</p>
            </div>
            <Badge variant="outline" className={isDelivered ? 'bg-accent/10 text-accent border-accent/20' : 'bg-amber-50 text-amber-700 border-amber-200'}>
              {isDelivered ? 'Delivered' : (donation.status || '').replace('_', ' ')}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
            {[
              { label: 'Donor', value: donation.donor_name },
              { label: 'Receiver', value: donation.claimed_by_name || '—' },
              { label: 'Volunteer', value: donation.volunteer_name || '—' },
            ].map(f => (
              <div key={f.label}>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">{f.label}</span>
                <p className="font-medium text-sm mt-0.5">{f.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {isDelivered ? (
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="w-16 h-16 text-accent mx-auto mb-3" />
            <h3 className="text-lg font-bold">Delivery Verified ✓</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {donation.verified_at ? `Verified at ${new Date(donation.verified_at).toLocaleString()}` : 'Verified'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Volunteer: show QR code */}
          {isVolunteer && donation.qr_code && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Your QR Code</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Show this to the receiver to confirm delivery.</p>
                <QRCodeDisplay code={donation.qr_code} />
              </CardContent>
            </Card>
          )}

          {/* Receiver: enter/scan code */}
          {isReceiver && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="w-4 h-4" />Verify Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Ask the volunteer for their code and enter it below.</p>
                <div className="flex gap-2">
                  <Input
                    value={verifyCode}
                    onChange={e => setVerifyCode(e.target.value.toUpperCase())}
                    placeholder="e.g. A1B2C3D4"
                    className="font-mono tracking-widest uppercase"
                    maxLength={8}
                  />
                  <Button
                    onClick={() => verifyMutation.mutate()}
                    disabled={verifyCode.length < 4 || verifyMutation.isPending}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shrink-0"
                  >
                    {verifyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Verify
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!isVolunteer && !isReceiver && (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Only the assigned volunteer or receiver can verify this delivery.</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
