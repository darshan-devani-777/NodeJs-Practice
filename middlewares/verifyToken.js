const jwt = require("jsonwebtoken");
const { db } = require("../models/dbconfig");

module.exports = {
  verifyToken: async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
  
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authorization token is missing or invalid." });
      }
  
      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Session Expired! Please Log In again!" });
      }
  
      const result = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  
      // Fetch user correctly using user_id
      const user = await db.users.findOne({
        where: { user_id: result.id },
        attributes: ["user_id", "first_name", "last_name", "email", "profile_image", "bio", "is_admin"],
      });
  
      if (!user) {
        return res.status(401).json({ message: "Session Expired! Please Log In again!" });
      }
  
      res.cookie("user", result, { maxAge: 3600 * 1000 });
  
      req.body["logged_in_user"] = user;
      req.user = user;
  
      next();
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }
  },
  

  verifyTokenAdmin: async (req, res, next) => {
    try {
      if(typeof req?.cookies?.accessToken == "undefined") {
        res.redirect('/users/admin/login');
        // res.render('login')
      } else {
        const token = req?.cookies?.accessToken;

        if (token != "") {
          let result = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
          const user = await db.users.findByPk(result.id, {
            attributes: ["user_id", "first_name", "last_name", "email", "profile_image", "bio", "image_name", "profile_image"],
          });

          if (!user) {
            // return res.redirect('/users/admin/login');
            res.render('login')
          }
  
          if(!req?.cookies?.logged_in_user) {
            res.cookie("logged_in_user", JSON.stringify(user), {
              maxAge: 3600 * 1000,
            });
          }

          req.body["logged_in_user"] = user;
          req.user = user;
          
          next();
        } else {
          return res.redirect('/users/admin/login');
          // res.render('login')
        }
      }
    } catch (error) {
      return res.redirect('/users/admin/login');
      // res.render('login')
    }
  },

  checkRole: async (req, res, next) => {
    try {
      console.log("checkRole triggered, req.user =", req.user);
  
      const user = req.user;
      if (!user) return res.status(401).json({ message: "User not authenticated." });
  
      if (!user.is_admin) return res.status(403).json({ message: "Unauthorized access." });
  
      next();
    } catch (error) {
      console.error("Error in checkRole middleware:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  },   
 
};


