import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const { userId, planId } = await request.json();

    if (!userId || !planId) {
      return NextResponse.json({ error: 'User ID and plan ID are required' }, { status: 400 });
    }

    // Get the plan details
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
    }

    if (!plan.stripePriceId) {
      return NextResponse.json({ error: 'Plan price ID not configured' }, { status: 400 });
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
          planId: planId
        },
      });
      customerId = customer.id;

      // Update user document with Stripe customer ID
      await updateDoc(userRef, {
        stripeCustomerId: customerId,
        updatedAt: new Date()
      });
    }

    // Get success and cancel URLs
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const successUrl = `${origin}/app?subscription=success`;
    const cancelUrl = `${origin}/subscription?canceled=true`;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        firebaseUid: userId,
        planId: planId
      },
      subscription_data: {
        metadata: {
          firebaseUid: userId,
          planId: planId
        },
        trial_period_days: 0, // No additional trial since we handle it in our app
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_update: {
        address: 'auto',
        name: 'auto'
      },
      // Custom text for better UX
      custom_text: {
        shipping_address: null,
        submit: {
          message: 'Subscribe to continue your intimate journey with unlimited access to all premium features.'
        }
      }
    });

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 