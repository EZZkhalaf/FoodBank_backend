const jwt = require('jsonwebtoken');


const generateTokenAndSetCookie = (user_id , res) =>{
    const token = jwt.sign({user_id},process.env.JWT_SECRET,{
        expiresIn : '15d'
    });

    res.cookie("jwt" , token , {
        maxAge: 15*24*60*60*1000 ,//15 days in melli sec
        httpOnly : true , //protecting from attacks(only accessable from http not other sides like js)
        sameSite : 'strict' , //other websites attacks
        secure: process.env.NODE_ENV !== 'development',

    })
}

module.exports = {generateTokenAndSetCookie};