import express from "express";
import { login, register, updateProfile } from "../controller/user.controller";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/profile/update", updateProfile);

