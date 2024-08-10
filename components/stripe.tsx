import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { app, PrioriteUser } from '@/utils/firebase';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const environment = process.env.environment;
const pub_key = environment === 'production' ? process.env.NETX_APP_stripe_pk : process.env.NEXT_APP_stripe_pk_test;
const stripePromise = loadStripe(pub_key);

const PurchaseCredits = ({ username }: { username: string }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [clientSecret, setClientSecret] = useState('');
    const [user, setUser] = useState(null);
    const [credits, setCredits] = useState(0);

    useEffect(() => {
        const fetchUserAndClientSecret = async () => {
            const db = getFirestore(app);
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('name', '==', username));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userData = querySnapshot.docs[0].data();
                setUser(userData);
                setCredits(userData.credits);

                // Fetch the client secret from the backend
                const response = await fetch('/create-payment-intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });
                const data = await response.json();
                setClientSecret(data.clientSecret);
            } else {
                console.error('User not found');
            }
        };

        fetchUserAndClientSecret();
    }, [username]);

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
            <button className="bg-red" type="submit" disabled={!stripe || !clientSecret}>Buy More Credits</button>
        </form>
    );
};

const App = ({ username }) => {
    return (
        <Elements stripe={stripePromise}>
            <PurchaseCredits username={username} />
        </Elements>
    );
};

export default App;