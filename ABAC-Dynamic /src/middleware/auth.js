const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req,res,next)=>{
  const token = req.header("Authorization")?.replace("Bearer ","");

  if(!token){
    return res.status(401).json({
      traceId:res.locals.traceId,
      status:"FAILED",
      message:"Authentication token missing."
    });
  }

  try{
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if(!user) throw new Error();
    req.user = user;
    next();
  }catch{
    res.status(401).json({
      traceId:res.locals.traceId,
      status:"FAILED",
      message:"Invalid or expired token."
    });
  }
};