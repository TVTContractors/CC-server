const express = require('express');
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51QKcIFFQuaYsVoVksmWrQDDZ9JWrrKpLHMZNyBXtg0T2ZR45wSU15FKBM7f5eEOTvrBq36feG0S9abT7jx7ewfV000aTotE3WZ'); // Secret key

const router = express.Router();

router.post('/create-payment-intent', async (req, res) => {
  const { totalAmount } = req.body;

  try {
    console.log(totalAmount,"came here")

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'food order',
            },
            unit_amount: Math.round(totalAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000/all-orders',
      cancel_url: 'http://localhost:3000/all-orders',
    });

    res.json({ id: session.id });
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(totalAmount * 100), // amount in cents
    //   currency: 'usd',
    //   payment_method_types: ['card'],
    // });
    // console.log(paymentIntent, "======================")

    // res.send({
    //   clientSecret: paymentIntent.client_secret,
    // });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).send('Payment intent creation failed');
  }
});

module.exports = router;
