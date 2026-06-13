import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const roleColors = {
  donor:     'bg-primary/10 text-primary border-primary/20',
  receiver:  'bg-blue-50 text-blue-700 border-blue-200',
  volunteer: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const roleLabels = {
  donor: 'Donor',
  receiver: 'NGO',
  volunteer: 'Volunteer',
};

function getSenderRole(donation, email) {
  if (email === donation.donor_email) return 'donor';
  if (email === donation.claimed_by) return 'receiver';
  if (email === donation.volunteer_email) return 'volunteer';
  return 'donor';
}

export default function ChatPanel({ donation }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const isParticipant = user && (
    user.email === donation?.donor_email ||
    user.email === donation?.claimed_by ||
    user.email === donation?.volunteer_email
  );

  // Load messages initially
  useEffect(() => {
    if (!donation?.id) return;
    setLoading(true);
    base44.entities.DonationMessage.filter({ donation_id: donation.id }, 'created_date', 100)
      .then(msgs => { setMessages(msgs); setLoading(false); });
  }, [donation?.id]);

  // Real-time subscription
  useEffect(() => {
    if (!donation?.id) return;
    const unsub = base44.entities.DonationMessage.subscribe((event) => {
      if (event.data?.donation_id !== donation.id) return;
      if (event.type === 'create') setMessages(prev => [...prev, event.data]);
      if (event.type === 'delete') setMessages(prev => prev.filter(m => m.id !== event.id));
    });
    return unsub;
  }, [donation?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    await base44.entities.DonationMessage.create({
      donation_id: donation.id,
      sender_email: user.email,
      sender_name: user.full_name,
      sender_role: getSenderRole(donation, user.email),
      text: text.trim(),
    });
    setText('');
    setSending(false);
  };

  const isMe = (msg) => msg.sender_email === user?.email;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
        <MessageCircle className="w-4 h-4 text-primary" />
        <span className="font-semibold text-sm text-foreground">Coordination Chat</span>
        <span className="text-xs text-muted-foreground ml-1">— visible to donor, NGO & volunteer</span>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-3">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <MessageCircle className="w-8 h-8 text-muted-foreground/40 mb-2" />
            <p className="text-xs text-muted-foreground">No messages yet. Start coordinating!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const mine = isMe(msg);
              return (
                <div key={msg.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                  {!mine && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs font-semibold text-foreground">{msg.sender_name}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${roleColors[msg.sender_role] || roleColors.donor}`}>
                        {roleLabels[msg.sender_role] || msg.sender_role}
                      </span>
                    </div>
                  )}
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-snug
                    ${mine
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-card border text-foreground rounded-bl-sm'}`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 px-1">
                    {formatDistanceToNow(new Date(msg.created_date), { addSuffix: true })}
                  </span>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      {isParticipant ? (
        <form onSubmit={send} className="flex gap-2 px-4 py-3 border-t bg-background">
          <Input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 h-9"
            maxLength={500}
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={!text.trim() || sending} className="bg-primary hover:bg-primary/90 text-white shrink-0">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      ) : (
        <div className="px-4 py-3 border-t bg-muted/30 text-center text-xs text-muted-foreground">
          Only the donor, NGO, and volunteer can send messages.
        </div>
      )}
    </div>
  );
}
