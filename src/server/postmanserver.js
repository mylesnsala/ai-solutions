const express = require('express');
const pg = require('pg');
const nodemailer = require('nodemailer');

const app = express();

// PostgreSQL connection
const db = new pg.Pool({
  host: 'localhost',
  database: 'mydatabase',
  port: 5432,
});

// Nodemailer transporter
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'bakangmonei2@gmail.com',
    pass: 'ooecgothgtofixdk',
  },
});

// Generate a 6 digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

// Send OTP to email
async function sendOTP(email, otp) {
  let info = await transporter.sendMail({
    from: 'bakangmonei@gmail.com',
    to: email,
    subject: 'Your OTP',
    text: `Your OTP is ${otp}`,
    html: `<p>Your OTP is ${otp}</p>`,
  });

  console.log('Email sent: ' + info.response);
}

// Check email and send OTP
async function checkEmailAndSendOTP(email) {
  let query = {
    text: `SELECT email FROM users WHERE email = $1`,
    values: [email],
  };

  try {
    let result = await db.query(query);
    if (result.rows.length > 0) {
      let otp = generateOTP();
      await sendOTP(email, otp);
      console.log(`OTP sent to ${email}`);
    } else {
      console.log(`Email ${email} does not exist`);
    }
  } catch (err) {
    console.log(err);
  }
}

// Express route to send OTP
app.post('/send-otp', async (req, res) => {
  let email = req.body.email;
  await checkEmailAndSendOTP(email);
  res.send(`OTP sent to ${email}`);
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
