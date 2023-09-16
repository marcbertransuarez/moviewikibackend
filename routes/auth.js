const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { isAuthenticated, isAdmin } = require('../middlewares/jwt');
const saltRounds = 10;

// @desc SIGN UP new user
// @route POST /auth/signup
// @access Public
router.post('/signup', async (req, res, next) => {
    const { email, password, username } = req.body;

    if (email === '' || password === '' || username === '') {
        res.status(400).json({ message: 'Please fill all the fields to register' })
        return;
    }

    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if(!passwordRegex.test(password)) {
        res.status(400).json({ message: 'Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter'})
        return;
    }

    try {
        const userInDb = await User.findOne({ email })
        if(userInDb) {
            res.status(400).json({ message: 'User already exists' })
            return;
        } else {
            const salt = bcrypt.genSaltSync(saltRounds);
            const hashedPassword = bcrypt.hashSync(password, salt);
            const newUser = await User.create({
                email,
                hashedPassword,
                username
            });
            res.status(201).json({ data: newUser })
        }
    } catch (error) {
        res.status(400).json({ message: 'An error occurred creating a new user' })
    }
})

module.exports = router;