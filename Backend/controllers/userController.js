const User = require('../models/User');
const { Clerk } = require('@clerk/clerk-sdk-node');

const clerk = new Clerk(process.env.CLERK_SECRET_KEY);

// Sync Clerk user data with MongoDB
const syncUserFromClerk = async (req, res) => {
  try {
    const { clerkUserId } = req.body;

    // Fetch user details from Clerk
    const clerkUser = await clerk.users.getUser(clerkUserId);

    // Create/update user in MongoDB
    const user = await User.findOneAndUpdate(
      { clerkUserId },
      {
        email: clerkUser.emailAddresses[0].emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Get all users (for testing)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  syncUserFromClerk,
  getAllUsers
};