const isLogin = async (req, res, next) => {
    try {
      if (!req.session.user_id) {
        // Redirect to the login page or perform authentication here
        res.redirect("/");
      } else {
        next();
      }
    } catch (err) {
      console.log(err.message);
    }
  };
  
  
  
  const isLogout = async (req, res, next) => {
    try {
      if (req.session.user_id) {
        // Clear the session
       
          // Redirect to the login page or home page after logout
          res.redirect("/home");
      } else {
        next();
      }
    } catch (err) {
      console.log(err.message);
    }
  };

module.exports= {
    isLogin,
    isLogout
}