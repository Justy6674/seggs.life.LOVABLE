'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';
import { Mail, Copy, Check, Heart, UserPlus } from 'lucide-react';

interface PartnerInvitationProps {
  onSuccess?: () => void;
  className?: string;
}

export default function PartnerInvitation({ onSuccess, className = '' }: PartnerInvitationProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  const generateInviteLink = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Create invitation record
      const invitationRef = await addDoc(collection(db, 'partnerInvitations'), {
        invitedBy: user.uid,
        inviterEmail: user.email,
        inviteeEmail: email,
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        message: message || `${user.displayName || 'Your partner'} has invited you to join them on Seggs.Life for a more intimate connection.`,
        includesSubscriptionAccess: true // Partner gets shared access to subscription
      });

      const link = `${window.location.origin}/partner-invite/${invitationRef.id}`;
      setInviteLink(link);
      
      // If email provided, send invitation email
      if (email) {
        await fetch('/api/send-partner-invitation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            invitationId: invitationRef.id,
            inviterName: user.displayName || 'Your partner',
            inviterEmail: user.email,
            inviteeEmail: email,
            inviteLink: link,
            message: message,
            includesSubscriptionAccess: true
          })
        });
      }

      setSent(true);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating invitation:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-gradient-to-r from-emerald-600/20 to-green-600/20 backdrop-blur-sm rounded-2xl p-8 border border-emerald-400/30 text-center ${className}`}
      >
        <div className="text-4xl mb-4">💝</div>
        <h3 className="text-2xl font-serif font-bold text-wheat mb-4">
          Invitation Sent!
        </h3>
        <p className="text-wheat/80 mb-6">
          {email ? 
            `We've sent an invitation to ${email}. They'll receive an email with instructions to join you.` :
            'Your invitation link is ready to share!'
          }
        </p>

        {inviteLink && (
          <div className="bg-wheat/10 rounded-lg p-4 mb-6">
            <p className="text-wheat/70 text-sm mb-2">Share this link with your partner:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 bg-primary/60 border border-wheat/20 rounded-lg px-3 py-2 text-wheat text-sm"
              />
              <button
                onClick={copyLink}
                className="bg-deepRed hover:bg-deepRed/90 text-wheat px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        <p className="text-wheat/60 text-sm">
          They can join when they're ready. No pressure! 💕
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-burgundy/20 to-primary/20 backdrop-blur-sm rounded-2xl p-8 border border-wheat/30 ${className}`}
    >
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">👫</div>
        <h3 className="text-2xl font-serif font-bold text-wheat mb-2">
          Invite Your Partner
        </h3>
        <p className="text-wheat/70">
          When you're both ready, invite them to join your intimate journey together
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-wheat/80 text-sm font-medium mb-2 block">
            Partner's Email (Optional)
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-wheat/40 w-4 h-4" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="partner@example.com"
              className="w-full bg-primary/60 border border-wheat/20 rounded-lg pl-10 pr-4 py-3 text-wheat placeholder-wheat/40 focus:outline-none focus:border-wheat/50 transition-colors"
            />
          </div>
          <p className="text-wheat/60 text-xs mt-1">
            Leave blank to just get a shareable link
          </p>
        </div>

        <div>
          <label className="text-wheat/80 text-sm font-medium mb-2 block">
            Personal Message (Optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hey love, I've been exploring this amazing app for couples. Want to join me on this journey? 💕"
            rows={3}
            className="w-full bg-primary/60 border border-wheat/20 rounded-lg px-4 py-3 text-wheat placeholder-wheat/40 focus:outline-none focus:border-wheat/50 transition-colors resize-none"
          />
        </div>

        <button
          onClick={generateInviteLink}
          disabled={loading}
          className="w-full bg-deepRed hover:bg-deepRed/90 disabled:bg-deepRed/50 text-wheat px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-wheat/30 border-t-wheat rounded-full animate-spin" />
              Creating Invitation...
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              {email ? 'Send Invitation' : 'Create Invite Link'}
            </>
          )}
        </button>
      </div>

      <div className="mt-6 bg-wheat/5 rounded-lg p-4">
        <h4 className="text-wheat/90 text-sm font-semibold mb-2 flex items-center gap-2">
          <Heart className="w-4 h-4 text-deepRed" />
          How it works:
        </h4>
        <ul className="space-y-1 text-wheat/70 text-sm">
          <li>• Your partner gets their own private space to explore</li>
          <li>• They can take the blueprint assessment at their own pace</li>
          <li>• You can choose to sync your journeys when you're both ready</li>
          <li>• Everything stays private until you both decide to share</li>
        </ul>
      </div>
    </motion.div>
  );
} 