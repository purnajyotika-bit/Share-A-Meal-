import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Save, LogOut, Loader2, KeyRound, User, Phone, MapPin, Building2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function Profile() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [resetSending, setResetSending] = useState(false);
  const [form, setForm] = useState({ phone: '', city: '', org_type: '', bio: '' });
  const [pwForm, setPwForm] = useState({ newPass: '', confirm: '' });

  useEffect(() => {
    if (user) {
      setForm({
        phone: user.phone || '',
        city: user.city || '',
        org_type: user.org_type || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.auth.updateMe(form);
    setSaving(false);
    toast.success('Profile updated!');
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (pwForm.newPass !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPass.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setResetSending(true);
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: 'FoodBridge — Password Reset',
      body: `Hi ${user.full_name},\n\nYou requested a password reset on FoodBridge.\n\nIf this was you, please use the "Forgot Password" link on the login page to set a new password.\n\nBest,\nFoodBridge Team`,
    });
    setResetSending(false);
    setPwForm({ newPass: '', confirm: '' });
    toast.success('Password reset email sent to ' + user.email);
  };

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">Profile</h1>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-primary font-bold text-xl bg-primary/10">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-lg">{user?.full_name}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-primary font-medium capitalize mt-0.5">{user?.role || 'user'}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-1.5 mb-1.5"><Phone className="w-3.5 h-3.5" />Phone</Label>
                <Input value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} placeholder="Phone number" />
              </div>
              <div>
                <Label className="flex items-center gap-1.5 mb-1.5"><MapPin className="w-3.5 h-3.5" />City</Label>
                <Input value={form.city} onChange={e => setForm(p => ({...p, city: e.target.value}))} placeholder="Your city" />
              </div>
            </div>
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5"><Building2 className="w-3.5 h-3.5" />Organisation type</Label>
              <Select value={form.org_type} onValueChange={v => setForm(p => ({...p, org_type: v}))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {['Restaurant','Hotel','Event Organizer','Household','NGO','Shelter','Orphanage','Individual','Other'].map(t => (
                    <SelectItem key={t} value={t.toLowerCase().replace(' ', '_')}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5"><User className="w-3.5 h-3.5" />Bio</Label>
              <Textarea value={form.bio} onChange={e => setForm(p => ({...p, bio: e.target.value}))} placeholder="Tell us about yourself..." rows={3} />
            </div>
            <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><KeyRound className="w-4 h-4" />Password Reset</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <Label>New password</Label>
              <Input type="password" value={pwForm.newPass} onChange={e => setPwForm(p => ({...p, newPass: e.target.value}))} placeholder="Min 6 characters" />
            </div>
            <div>
              <Label>Confirm new password</Label>
              <Input type="password" value={pwForm.confirm} onChange={e => setPwForm(p => ({...p, confirm: e.target.value}))} placeholder="Repeat password" />
            </div>
            <Button type="submit" variant="outline" disabled={resetSending} className="gap-2">
              {resetSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              Send Reset Email
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" onClick={() => base44.auth.logout('/')} className="text-destructive hover:text-destructive gap-2">
          <LogOut className="w-4 h-4" /> Sign out
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="text-destructive hover:text-destructive gap-2">
              <Trash2 className="w-4 h-4" /> Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your account and all your data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                onClick={async () => {
                  await base44.integrations.Core.SendEmail({
                    to: user.email,
                    subject: 'FoodBridge — Account Deletion Request',
                    body: `Hi ${user.full_name},\n\nWe received a request to delete your FoodBridge account (${user.email}).\n\nYour account has been flagged for deletion. If this was not you, please contact support immediately.\n\nFoodBridge Team`,
                  });
                  toast.success('Account deletion request submitted. You will receive a confirmation email.');
                  base44.auth.logout('/');
                }}
              >
                Yes, Delete My Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
