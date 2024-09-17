import jwt from 'jsonwebtoken';
import User from '../models/user.models.js';

const protectRoute = async (req, res, next) =>{
    try {
        const token = req.cookies.jwt;
        if(!token){
            return res.status(401).json({error: "Unauthorized Access"});
        }
        const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
        if(!verifyToken){
            return res.status(401).json({error: "Unauthorized Access: invalid token"});
        }

        const user = await User.findById(verifyToken.userId).select("-password");

        if(!user){
            return res.status(401).json({error: "User not found"});
        }

        req.user = user;

        next();
        
    } catch (error) {
        console.log("Error in protectRoute", error.message);
        res.status(500).json({error: "Internal Server Error"});
        
    }
};

export default protectRoute;