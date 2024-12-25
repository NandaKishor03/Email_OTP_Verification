const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Store Email , OTP , Time
let storedEmail = null;
let storedOTP = null;
let VerifyTime = null;

// Generate's the OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999);
}

// OTP sent the given email
function sendOTP(email, otp) {
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "*********************", // Enter your Email Address
      pass: "***********", // Enter your Email Password
    },
  });

  const mailOptions = {
    from: "22951a6772@iare.ac.in",
    to: email,
    subject: "OTP Sent by Nanda Kishor",
    text: `Your OTP is ${otp}`,
  };

  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error in Sending Mail" + error);
    } else {
      console.log("Email Successfully Sent" + info.response);
    }
  });
}

// Home Page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Request to Generate and Send OTP
app.post("/request_otp", (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();
  storedEmail = email;
  storedOTP = otp;
  VerifyTime = Date.now() + 5 * 60 * 1000;
  sendOTP(storedEmail, storedOTP);
  return res
    .status(200)
    .json({ success: true, message: "OTP Sent to your email" });
});

// Verify the Generated OTP and Email
app.post("/verify_otp", (req, res) => {
  const { email, otp } = req.body;
  if (storedEmail !== email) {
    return res.status(400).json({ message: "Email does not match" });
  }
  if (Date.now() > VerifyTime) {
    return res.status(400).json({ message: "OTP Expired" });
  }
  if (parseInt(otp) === storedOTP) {
    return res
      .status(200)
      .json({ message: "OTP Verified Successfully, You are Authenticated" });
  } else {
    return res.status(400).json({ message: "Wrong OTP" });
  }
});

// For Hosting the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
