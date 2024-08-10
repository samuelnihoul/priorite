import Stripe from 'stripe';
import { NextResponse } from 'next/server';
const environment = process.env.environment
const secret_key = environment === 'production' ? process.env.stripe_secret : process.env.stripe_secret_test
// Initialize Stripe with your secret key
const stripe = new Stripe(secret_key
);

export async function POST(req: Request) {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 500, // 5 credits at 1 EUR each
            currency: 'eur',
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        return NextResponse.json({
            error: error.message,
        }, { status: 500 });
    }
}