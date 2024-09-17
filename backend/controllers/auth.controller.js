import bcrypt from 'bcryptjs';
import User from "../models/user.models.js";
import generateTokenAndSetCookie from '../utils/generateToken.js';

export const signup = async (req,res) =>{
    try{
        const {fullName, userName, password, confirmPassword, gender} = req.body;
        if(password !== confirmPassword){
            return res.status(400).json({error:"Password doesn't match"});
        }

        const user = await User.findOne({userName});

        if(user){
            return res.status(400).json({error:"User already exists"});
        }

        //Hash password here
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        //https://avatar-placeholder.iran.liara.run/

        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?userName=${userName}`;
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?userName=${userName}`;

        const newUser = new User({
            fullName,
            userName,
            password: hashedPassword,
            gender,
            profilePicture: gender=="male" ? boyProfilePic : girlProfilePic
        });

        if(newUser){
            //generate jwt token here
            generateTokenAndSetCookie(newUser._id,res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                userName: newUser.userName,
                profilePicture: newUser.profilePicture
        });
        }else{
            res.status(400).json({error:"Invalid User Data"});
        }

    }
    catch(error){
        console.log("Error in signup",error.message);
        res.status(500).json({error:"Internal Server Error"});

    }
}

export const login = async (req,res) =>{
    try{
        const {userName, password} = req.body;
        const user = await User.findOne({userName});
        const isPasswordValid = await bcrypt.compare(password, user?.password || "");

        if(!user || !isPasswordValid){
            return res.status(400).json({error:"Invalid Credentials"});
        }
        generateTokenAndSetCookie(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            userName: user.userName,
            profilePicture: user.profilePicture
        });

    }catch(error){
        console.log("Error in login",error.message);
        res.status(500).json({error:"Internal Server Error"});

    }
}


export const logout = async (req,res) =>{
    try{
        res.cookie("jwt","",{maxAge: 0});
        res.status(200).json({message:"Logged out successfully"});

    }catch(error){
        console.log("Error in logout",error.message);
        res.status(500).json({error:"Internal Server Error"});

    }
}