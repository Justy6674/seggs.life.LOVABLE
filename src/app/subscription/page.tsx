'use client';

import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/navigation/AppLayout';
import SubscriptionPlans from '@/components/SubscriptionPlans';
import Auth from '@/components/Auth';

export default function SubscriptionPage() {
  const { user } = useAuth();

  if (!user) {
    return <Auth />;
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-primary py-8">
        <SubscriptionPlans />
      </div>
    </AppLayout>
  );
} 