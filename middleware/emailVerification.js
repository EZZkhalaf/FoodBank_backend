const axios = require('axios');

const emailVerification = async(req,res,next) => {
    const email = req.body.email;
    const verification_api = process.env.HUNTER_API_KEY;
    

    try {
        const responseAPI = await axios.get(`https://api.hunter.io/v2/email-verifier` , {
            params:{
                email,
                api_key:verification_api
            }
        })

        const data = await responseAPI.data.data;
        if (data.status !== "valid") {
        return res.status(400).json({ message: "Invalid email address", details: data });
        }

        next(); // continue
  } catch (error) {
        console.error("Email verification error:", error.message);
        res.status(500).json({ message: "Email verification failed" });
  }
}


module.exports = emailVerification;