import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { getSubscriptionPlan } from '@/lib/subscription-plans';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const { userId, priceId, planId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // If planId is provided, get the price ID from our subscription plans
    let finalPriceId = priceId;
    if (planId && !priceId) {
      const plan = await getSubscriptionPlan(planId);
      if (!plan) {
        return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
      }
      finalPriceId = plan.stripePriceId;
    }

    // Default to environment price ID if nothing is provided
    if (!finalPriceId) {
      finalPriceId = process.env.STRIPE_PREMIUM_PRICE_ID;
    }

    if (!finalPriceId) {
      return NextResponse.json({ error: 'No price ID available' }, { status: 400 });
    }

    // Get user data from Firebase
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userSnap.data();
    let customerId = userData.stripeCustomerId;

    // Create or retrieve Stripe customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: {
          firebaseUid: userId,
          planId: planId || 'premium_monthly'
        },
      });
      customerId = customer.id;

      // Update user document with Stripe customer ID
      await updateDoc(userRef, {
        stripeCustomerId: customerId,
        updatedAt: new Date()
      });
    }

    // Check if user is part of a couple
    const coupleId = userData.coupleId;
    let successUrl = `${request.headers.get('origin')}/app?success=true`;
    let cancelUrl = `${request.headers.get('origin')}/app?canceled=true`;

    // Customize URLs based on context
    if (coupleId) {
      successUrl = `${request.headers.get('origin')}/app?upgrade=success&couple=${coupleId}`;
      cancelUrl = `${request.headers.get('origin')}/app?upgrade=canceled&couple=${coupleId}`;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        firebaseUid: userId,
        planId: planId || 'premium_monthly',
        coupleId: coupleId || ''
      },
      subscription_data: {
        metadata: {
          firebaseUid: userId,
          planId: planId || 'premium_monthly',
          coupleId: coupleId || ''
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
      },
      // Add custom fields for better user experience
      custom_fields: [
        {
          key: 'relationship_stage',
          label: {
            type: 'custom',
            custom: 'Relationship Stage'
          },
          type: 'dropdown',
          dropdown: {
            options: [
              { label: 'Dating (< 1 year)', value: 'dating' },
              { label: 'Committed (1-3 years)', value: 'committed' },
              { label: 'Long-term (3+ years)', value: 'longterm' },
              { label: 'Married', value: 'married' },
              { label: 'Prefer not to say', value: 'private' }
            ]
          },
          optional: true
        }
      ]
    });

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id,
      planId: planId || 'premium_monthly'
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user's subscription status
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userSnap.data();
    const customerId = userData.stripeCustomerId;

    if (!customerId) {
      return NextResponse.json({ 
        subscriptionStatus: 'none',
        subscriptions: [],
        planId: 'free'
      });
    }

    // Get customer's subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 10,
    });

    const activeSubscription = subscriptions.data.find(
      sub => sub.status === 'active' || sub.status === 'trialing'
    );

    // Get plan information if available
    let planId = 'free';
    let planDetails = null;

    if (activeSubscription) {
      planId = activeSubscription.metadata.planId || 'premium_monthly';
      planDetails = await getSubscriptionPlan(planId);
    }

    return NextResponse.json({
      subscriptionStatus: activeSubscription?.status || 'none',
      planId,
      planDetails,
      subscriptions: subscriptions.data.map(sub => ({
        id: sub.id,
        status: sub.status,
        current_period_start: sub.current_period_start,
        current_period_end: sub.current_period_end,
        trial_end: sub.trial_end,
        cancel_at_period_end: sub.cancel_at_period_end,
        planId: sub.metadata.planId || 'premium_monthly'
      })),
    });
  } catch (error) {
    console.error('Error getting subscription:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription' },
      { status: 500 }
    );
  }
} 