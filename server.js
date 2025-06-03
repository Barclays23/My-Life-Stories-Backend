
// const Razorpay = require('razorpay');
// const crypto = require('crypto');
// import razorpayInstance from './razorPay/razorpayInstance.js';



// const razorpayInstance = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY,
//   key_secret: process.env.RAZORPAY_SECRET
// });



// app.post('/api/create-order', async (req, res) => {
//   try {
//     const options = {
//       amount: req.body.amount,
//       currency: req.body.currency,
//       receipt: `receipt_${Date.now()}`
//     };
//     const order = await razorpayInstance.orders.create(options);
//     res.json(order);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to create order' });
//   }
// });



// app.post('/api/verify-payment', (req, res) => {
//   const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
//   const generated_signature = crypto
//     .createHmac('sha256', 'YOUR_RAZORPAY_SECRET')
//     .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//     .digest('hex');

//   if (generated_signature === razorpay_signature) {
//     res.json({ success: true });
//   } else {
//     res.json({ success: false });
//   }
// });