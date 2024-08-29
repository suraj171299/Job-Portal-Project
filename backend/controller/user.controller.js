import { User } from "../models/user.models.js";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body
        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            })
        }

        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({
                message: "User with this email already exists",
                success: false
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {

            }
        })

        return res.status(201).json({
            message: "Account created successfully",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}


export const login = async (res, req) => {
    try {
        const { email, password, role } = req.body;
        if (!!email || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            })
        }

        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Incorrect Email",
                success: false
            })
        }

        const isPassword = await bcrypt.compare(password, user.password);

        if (!isPassword) {
            return res.status(400).json({
                message: "Incorrect Password",
                success: false
            })
        }

        if (role != user.role) {
            return res.status(400).json({
                message: "Wrong role for this account",
                success: false
            })
        }

        const tokenData = {
            userId: user._id
        }

        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: "1d" })

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'strict' }).json({
            message: `Welcome Back ${user.fullname}`,
            user,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logged Out successfully",
            success: true
        })

    } catch (error) {
        console.log(error);
    }
}

export const updateProfile = async (req, res) => {
    try {
        const {fullname, email, bio, skills, phoneNumber} = req.body;
        if (!fullname || !email || !phoneNumber || !bio || !skills) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            })
        }

        const skillsArray = skills.split(",");
        const userId = req.id;

        let user = await User.findById(userId);

        if(!user){
            res.status(400).json({
                message: "User not found",
                success:false
            })
        }

        user.fullname = fullname,
        user.email = email,
        user.phoneNumber = phoneNumber,
        user.bio = bio,
        user.profile.skills = skillsArray

        await user.save();

        

    } catch (error) {
        console.log(error);
    }
}