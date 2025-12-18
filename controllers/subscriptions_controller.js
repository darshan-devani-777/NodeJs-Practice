const asyncHandler = require("express-async-handler");
const { db } = require("../models");

const subscribeEmail = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user?.user_id || null;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const existing = await db.subscriptions.findOne({ where: { email } });

    const getUserData = async (user_id) => {
      if (!user_id) return null;
      return await db.users.findOne({
        where: { user_id },
        attributes: [
          "user_id",
          "first_name",
          "last_name",
          "email",
          "profile_image",
          "bio",
          "country",
          "is_verified",
          "is_active",
          "email_subscription",
          "created_at",
          "updated_at",
        ],
      });
    };

    // Update email_subscription array in users table
    const updateUserEmailSubscription = async (user_id, email) => {
      if (!user_id) return;
      const user = await db.users.findOne({ where: { user_id } });
      if (user) {
        const current = Array.isArray(user.email_subscription)
          ? user.email_subscription
          : [];
        if (!current.includes(email)) {
          await user.update({ email_subscription: [...current, email] });
        }
      }
    };

    // Already subscribed
    if (existing && existing.is_active) {
      const user = await getUserData(existing.user_id);
      return res.status(200).json({
        success: true,
        message: "Already subscribed to our newsletter.",
        data: user,
      });
    }

    // Reactivate subscription
    if (existing && !existing.is_active) {
      await existing.update({
        is_active: true,
        unsubscribed_at: null,
      });
      await updateUserEmailSubscription(existing.user_id, email);

      const user = await getUserData(existing.user_id);
      return res.status(200).json({
        success: true,
        message: "Subscription reactivated successfully.",
        data: user,
      });
    }

    // Create new subscription
    await db.subscriptions.create({
      user_id: userId,
      email,
      is_active: true,
    });

    await updateUserEmailSubscription(userId, email);

    const user = await getUserData(userId);
    return res.status(201).json({
      success: true,
      message: "Subscribed successfully!",
      data: user,
    });
  } catch (error) {
    console.error("Subscription error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while subscribing.",
    });
  }
});

const unsubscribeEmail = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required to unsubscribe.",
      });
    }

    const subscription = await db.subscriptions.findOne({ where: { email } });

    if (!subscription || !subscription.is_active) {
      return res.status(404).json({
        success: false,
        message: "No active subscription found for this email.",
      });
    }

    // Deactivate subscription record
    await subscription.update({
      is_active: false,
      unsubscribed_at: new Date(),
    });

    if (subscription.user_id) {
      const user = await db.users.findOne({ where: { user_id: subscription.user_id } });

      if (user) {
        let currentSubs = user.email_subscription;

        if (typeof currentSubs === "string") {
          try {
            currentSubs = JSON.parse(currentSubs);
          } catch {
            currentSubs = [];
          }
        }

        if (!Array.isArray(currentSubs)) {
          currentSubs = [];
        }

        const updatedSubs = currentSubs.filter((e) => e !== email);

        await user.update({ email_subscription: updatedSubs });
      }
    }

    const user = await db.users.findOne({
      where: { user_id: subscription.user_id },
      attributes: [
        "user_id",
        "first_name",
        "last_name",
        "email",
        "profile_image",
        "bio",
        "country",
        "is_verified",
        "is_active",
        "email_subscription",
        "created_at",
        "updated_at",
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Subscription unsubscribed successfully.",
      data: user || { email },
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while unsubscribing.",
    });
  }
});

module.exports = {
  subscribeEmail,
  unsubscribeEmail,
};
