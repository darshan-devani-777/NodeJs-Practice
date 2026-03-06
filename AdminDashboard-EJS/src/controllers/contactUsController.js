const ContactUs = require('../models/ContactUs');
const logActivity = require("../utils/activityLogger");

/* ------------------- SUBMIT CONTACT FORM ------------------- */
exports.submitContact = async (req, res) => {
  try {
    const { name, email, subject, message, phone } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    const contact = await ContactUs.create({
      name,
      email,
      subject,
      message,
      phone: phone || '',
      user: req.user?._id || null 
    });

    await logActivity({
      user: req.user?._id || null,
      action: "SUBMIT_CONTACT",
      description: "Contact us form submitted",
      req,
      status: "success",
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! We will contact you within 24 hours.',
      data: { contact }
    });

  } catch (error) {
    console.error("CONTACT ERROR:", error);
    await logActivity({
      user: req.user?._id || null,
      action: "SUBMIT_CONTACT",
      description: "Contact us form submission failed",
      req,
      status: "failed",
    });
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ------------------- VIEW AL MESSAGES ------------------- */
exports.viewContactUs = async (req, res) => {
  try {
    const {
      search = "",
      filter = "all",
      sort = "newest",
      cursor,
      limit = 10
    } = req.query;

    let query = {};
    let sortOption = { _id: -1 }; 

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } }
      ];
    }

    if (filter === "unread") query.isRead = false;
    if (filter === "read") query.isRead = true;

    if (filter === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      query.createdAt = { $gte: start };
    }

    if (sort === "oldest") sortOption = { _id: 1 };
    if (sort === "newest") sortOption = { _id: -1 };

    if (cursor) {
      query._id =
        sortOption._id === -1
          ? { $lt: cursor }
          : { $gt: cursor };
    }

    const messages = await ContactUs.find(query)
      .sort(sortOption)
      .limit(Number(limit) + 1);

    const hasNextPage = messages.length > Number(limit);
    if (hasNextPage) messages.pop();

    res.json({
      success: true,
      message: "Contact us messages retrieved successfully",
      data: messages,
      pageInfo: {
        nextCursor: hasNextPage
          ? messages[messages.length - 1]._id
          : null,
        hasNextPage
      }
    });

  } catch (error) {
    await logActivity({
      user: req.user?._id || null,
      action: "VIEW_CONTACT_US",
      description: "View contact us messages failed",
      req,
      status: "failed",
    });
    res.status(500).json({ success: false, message: "Failed to retrieve contact us messages" });
  }
};

/* ------------------- MARK AS READ ------------------- */
exports.markAsRead = async (req, res) => {
  try {
    await ContactUs.findByIdAndUpdate(req.params.id, { isRead: true });
    await logActivity({
      user: req.user?._id || null,
      action: "MARK_AS_READ",
      description: "Marked as read successfully",
      req,
      status: "success",
    });
    res.json({
      message: 'Marked as read successfully',
      success: true,
    });
  } catch (error) {
    await logActivity({
      user: req.user?._id || null,
      action: "MARK_AS_READ",
      description: "Marked as read failed",
      req,
      status: "failed",
    });
    res.status(500).json({
      success: false,
      message: 'Failed to update'
    });
  }
};

/* ------------------- DELETE CONTACT US MESSAGE ------------------- */
exports.deleteContact = async (req, res) => {
  try {
    await ContactUs.findByIdAndDelete(req.params.id);
    await logActivity({
      user: req.user?._id || null,
      action: "DELETE_CONTACT_US",
      description: "Contact us message deleted successfully",
      req,
      status: "success",
    });
    res.json({
      message: 'Contact us message deleted successfully',
      success: true,
    });
  } catch (error) {
    await logActivity({
      user: req.user?._id || null,
      action: "DELETE_CONTACT_US",
      description: "Contact us message deleted failed",
      req,
      status: "failed",
    });
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact us message'
    });
  }
};
