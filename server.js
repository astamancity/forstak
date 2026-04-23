const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ Error:', err));

const Offer = mongoose.model('Offer', {
  title: String, icon: String, category: String,
  location: String, priceNew: Number, priceOld: Number,
  stock: Number, totalStock: Number, badge: String, active: Boolean
});

const User = mongoose.model('User', {
  name: String, phone: String, password: String
});

const Coupon = mongoose.model('Coupon', {
  code: String, offerId: String, offerTitle: String,
  offerIcon: String, category: String, priceNew: Number,
  priceOld: Number, payMethod: String, userId: String,
  userName: String, userPhone: String, buyDate: Date,
  expiryDate: Date, status: String
});

app.get('/api/offers', async (req, res) => {
  const offers = await Offer.find({ active: { $ne: false } });
  res.json(offers);
});

app.post('/api/offers', async (req, res) => {
  const offer = new Offer(req.body);
  await offer.save();
  res.json(offer);
});

app.put('/api/offers/:id', async (req, res) => {
  const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(offer);
});

app.delete('/api/offers/:id', async (req, res) => {
  await Offer.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.post('/api/users/register', async (req, res) => {
  const { name, phone, password } = req.body;
  const existing = await User.findOne({ phone });
  if (existing) return res.status(400).json({ error: 'الرقم موجود بالفعل' });
  const user = new User({ name, phone, password });
  await user.save();
  res.json(user);
});

app.post('/api/users/login', async (req, res) => {
  const { phone, password } = req.body;
  const user = await User.findOne({ phone, password });
  if (!user) return res.status(400).json({ error: 'بيانات غلط' });
  res.json(user);
});

app.get('/api/coupons', async (req, res) => {
  const coupons = await Coupon.find();
  res.json(coupons);
});

app.get('/api/coupons/user/:userId', async (req, res) => {
  const coupons = await Coupon.find({ userId: req.params.userId });
  res.json(coupons);
});

app.post('/api/coupons', async (req, res) => {
  const coupon = new Coupon(req.body);
  await coupon.save();
  await Offer.findByIdAndUpdate(req.body.offerId, { $inc: { stock: -1 } });
  res.json(coupon);
});

app.put('/api/coupons/:id/use', async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(
    req.params.id, { status: 'مُستخدم' }, { new: true }
  );
  res.json(coupon);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));