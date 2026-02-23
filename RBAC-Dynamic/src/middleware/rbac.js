module.exports = (permission)=>{
    return async (req,res,next)=>{
      const hasPerm = await req.user.hasPermission(permission);
  
      if(!hasPerm){
        return res.status(403).json({
          traceId:res.locals.traceId,
          status:"DENIED",
          message:`Access denied. Missing permission: ${permission}`
        });
      }
  
      next();
    };
  };