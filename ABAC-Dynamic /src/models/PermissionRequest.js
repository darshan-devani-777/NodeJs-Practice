const mongoose = require("mongoose");

const permissionRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  permission: String,
  reason: String,
  status: {
    type:String,
    enum:[
      "PENDING_ADMIN",
      "PENDING_SUPERADMIN",
      "APPROVED",
      "REJECTED"
    ],
    default:"PENDING_ADMIN"
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref:"User" }
},{ timestamps:true });

module.exports = mongoose.model("PermissionRequest", permissionRequestSchema);