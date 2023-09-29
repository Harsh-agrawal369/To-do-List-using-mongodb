const jwt = require("jsonwebtoken");


const isLogin = async (req, res, next) => {
    try {
      const token = req.cookies.jwt;
      if (!token) {
        // Redirect to the login page or perform authentication here
        res.redirect("/");
      } else {
        jwt.verify(token, process.env.COOKIESESSIONKEY, (err, decodedToken) => {
          if(err){
            res.redirect("/");
          }else{
            next();
          }
        })
       
      }
    } catch (err) {
      console.log(err.message);
    }
};
  
  
  
  const isLogout = async (req, res, next) => {
    try {
      const token = req.cookies.jwt;
      if (token) {
        // Redirect to the login page or perform authentication here
        jwt.verify(token, process.env.COOKIESESSIONKEY, (err, decodedToken) => {
          if(err){
            next();
          }else{
            res.redirect("/home");
          }
        })
        
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