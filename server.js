
require('dotenv').config()
require('./db');

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: process.env.ORIGIN
}));
app.set('trust proxy', 1);

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

//router require
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');

//routes intro
app.use('/', indexRouter)
app.use('/auth', authRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});

module.exports = app;