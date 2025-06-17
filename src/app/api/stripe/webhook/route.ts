import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Helper function to update user subscription status in the new simplified model
async function updateSubscriptionStatus(
  firebaseUid: string, 
  planId: string, 
  status: string, 
  subscriptionId: string,
  customerId: string,
  currentPeriodStart?: number,
  currentPeriodEnd?: number
) {
  try {
    // Update userSubscriptions document (new simplified model)
    const subscriptionRef = doc(db, 'userSubscriptions', firebaseUid);
    
    const subscriptionData = {
      planId: status === 'active' ? planId : null,
      status: status === 'active' ? 'active' : 
              status === 'canceled' ? 'cancelled' : 
              status === 'past_due' ? 'expired' : 'expired',
      trialStartDate: null, // Trial is handled separately in our app
      trialEndDate: null,
      subscriptionStartDate: currentPeriodStart ? new Date(currentPeriodStart * 1000) : new Date(),
      subscriptionEndDate: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      updatedAt: new Date()
    };

    const subscriptionSnap = await getDoc(subscriptionRef);
    if (subscriptionSnap.exists()) {
      await updateDoc(subscriptionRef, subscriptionData);
    } else {
      await setDoc(subscriptionRef, subscriptionData);
    }

    // Also update user document for backwards compatibility
    const userRef = doc(db, 'users', firebaseUid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      await updateDoc(userRef, {
        stripeCustomerId: customerId,
        subscriptionId: subscriptionId,
        subscriptionStatus: status,
        planId: status === 'active' ? planId : null,
        subscriptionUpdatedAt: new Date(),
        updatedAt: new Date()
      });

      const userData = userSnap.data();
      const coupleId = userData.coupleId;

      // If user is part of a couple, update couple subscription
      if (coupleId) {
        const coupleRef = doc(db, 'couples', coupleId);
        const coupleSnap = await getDoc(coupleRef);
        
        if (coupleSnap.exists()) {
          const isPremium = status === 'active' || status === 'trialing';
          
          await updateDoc(coupleRef, {
            subscriptionStatus: isPremium ? 'premium' : 'free',
            subscriptionId: subscriptionId,
            billingUserId: firebaseUid,
            subscriptionUpdatedAt: new Date(),
            updatedAt: new Date()
          });

          console.log(`Updated couple ${coupleId} subscription to ${status} (plan: ${planId})`);
        }
      }
    }

    console.log(`Updated user ${firebaseUid} subscription to ${status} (plan: ${planId})`);
  } catch (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Webhook signature verification failed:', errorMessage);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription event:', subscription.id, subscription.status);
        
        if (subscription.metadata.firebaseUid) {
          await updateSubscriptionStatus(
            subscription.metadata.firebaseUid,
            subscription.metadata.planId || 'premium_monthly',
            subscription.status,
            subscription.id,
            subscription.customer as string,
            subscription.current_period_start,
            subscription.current_period_end
          );
        } else {
          console.warn('Subscription without firebase UID:', subscription.id);
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        console.log('Subscription cancelled:', deletedSubscription.id);
        
        if (deletedSubscription.metadata.firebaseUid) {
          await updateSubscriptionStatus(
            deletedSubscription.metadata.firebaseUid,
            'free',
            'cancelled',
            deletedSubscription.id,
            deletedSubscription.customer as string
          );
        }
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment succeeded for subscription:', invoice.subscription);
        
        // If this is for a subscription, make sure it's marked as active
        if (invoice.subscription) {
          const subscriptionDetails = await stripe.subscriptions.retrieve(invoice.subscription as string);
          
          if (subscriptionDetails.metadata.firebaseUid) {
            await updateSubscriptionStatus(
              subscriptionDetails.metadata.firebaseUid,
              subscriptionDetails.metadata.planId || 'premium_monthly',
              'active',
              subscriptionDetails.id,
              subscriptionDetails.customer as string,
              subscriptionDetails.current_period_start,
              subscriptionDetails.current_period_end
            );
          }
        }
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        console.log('Payment failed for subscription:', failedInvoice.subscription);
        
        if (failedInvoice.subscription) {
          const subscriptionDetails = await stripe.subscriptions.retrieve(failedInvoice.subscription as string);
          
          if (subscriptionDetails.metadata.firebaseUid) {
            await updateSubscriptionStatus(
              subscriptionDetails.metadata.firebaseUid,
              subscriptionDetails.metadata.planId || 'premium_monthly',
              'past_due',
              subscriptionDetails.id,
              subscriptionDetails.customer as string,
              subscriptionDetails.current_period_start,
              subscriptionDetails.current_period_end
            );
          }
        }
        break;

      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', session.id);
        
        // Handle successful checkout
        if (session.metadata?.firebaseUid && session.subscription) {
          const subscriptionDetails = await stripe.subscriptions.retrieve(session.subscription as string);
          
          await updateSubscriptionStatus(
            session.metadata.firebaseUid,
            session.metadata.planId || 'premium_monthly',
            subscriptionDetails.status,
            subscriptionDetails.id,
            subscriptionDetails.customer as string,
            subscriptionDetails.current_period_start,
            subscriptionDetails.current_period_end
          );

          console.log('Checkout completed, subscription updated:', session.metadata.firebaseUid);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
} 