import dotenv from 'dotenv';
dotenv.config();

import connectDB from '../config/db';
import User from '../models/user.model';
import mongoose from 'mongoose';

// --- Edit these to whatever you want your admin login to be ---
const ADMIN_NAME = 'Admin';
const ADMIN_EMAIL = 'admin@eatwise.com';
const ADMIN_PASSWORD = 'Admin1234'; // must have 1 uppercase + 1 number, 8+ chars
// ----------------------------------------------------------------

const run = async (): Promise<void> => {
  await connectDB();

  const existing = await User.findOne({ email: ADMIN_EMAIL, deletedAt: null });

  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`[Seed] Existing user ${ADMIN_EMAIL} promoted to admin.`);
    } else {
      console.log(`[Seed] ${ADMIN_EMAIL} is already an admin. Nothing to do.`);
    }
  } else {
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      profileComplete: true,
    });
    console.log(`[Seed] Admin user created.`);
    console.log(`  Email:    ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});