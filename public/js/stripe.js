import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe("pk_test_51Q1pGSL4nFx5OAOerhmb1sKsXEwuOaIhplM5EaslDsKfD8aersiPTobg1CMvLXm9Nsr6PIokQAGZKTYFEpKpiIeO00o3qz8bhE");

export const bookTour = async tourId => {
    try {
        // 1) Get checkout session from API
        const session = await axios(
            `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
        );

        // console.log('Session:', session.data);

        // 2) Create checkout form + charge credit card
        const result = await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });

        if (result.error) {
            // Handle any errors
            showAlert('error', result.error.message);
        }
    } catch (err) {
        console.error('Error:', err);
        showAlert('error', err.response ? err.response.data.message : err.message);
    }
};
