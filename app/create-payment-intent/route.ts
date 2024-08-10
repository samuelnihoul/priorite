import stripe from '@stripe/react-stripe-js';
export async function POST( (req, res) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: 500, // 5 credits at 1 EUR each
        currency: 'eur',
    });
    res.send({
        clientSecret: paymentIntent.client_secret,
    });
});

});