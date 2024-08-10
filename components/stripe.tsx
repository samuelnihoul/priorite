import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const environment = process.env.environment
const pub_key = environment === 'production' ? process.env.NETX_APP_stripe_pk : process.env.NEXT_APP_stripe_pk_test
const stripePromise = loadStripe('your-publishable-key');

const PurchaseCredits = ({ user, setCredits, credits }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [clientSecret, setClientSecret] = useState('');

    useEffect(() => {
        // Fetch the client secret from the backend
        fetch('/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        })
            .then(res => res.json())
            .then(data => setClientSecret(data.clientSecret));
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements || !clientSecret) {
            return;
        }

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement),
            },
        });

        if (error) {
            console.error(error);
        } else if (paymentIntent.status === 'succeeded') {
            // Update user credits in the backend
            fetch('/api/update-credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, credits: 5 }),
            }).then(() => {
                // Update credits in the frontend
                setCredits(credits + 5);
            });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <CardElement />
            <button type="submit" disabled={!stripe || !clientSecret}>Pay</button>
        </form>
    );
};

// const App = ({ user }) => {
//     const [credits, setCredits] = useState(0);

//     useEffect(() => {
//         // Fetch user credits from the backend
//         fetch(`/api/get-credits?userId=${user.id}`)
//             .then(res => res.json())
//             .then(data => setCredits(data.credits));
//     }, [user]);

//     return (
//         <Elements stripe={stripePromise}>
//             <PurchaseCredits user={user} setCredits={setCredits} credits={credits} />
//         </Elements>
//     );
// };

// export default App;