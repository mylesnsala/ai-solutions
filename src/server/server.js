const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import CORS middleware

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

// POST endpoint for sending emails
app.post('/send-email', async (req, res) => {
  const { to, subject, text, attachments } = req.body;

  // Nodemailer configuration
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'bakangmonei2@gmail.com',
      pass: 'ooecgothgtofixdk',
    },
  });

  // Convert base64 encoded attachment content to Buffer
  const parsedAttachments = attachments.map(attachment => {
    const { filename, content, contentType } = attachment;
    const buffer = Buffer.from(content, 'base64'); // Decode base64 content
    return {
      filename,
      content: buffer,
      contentType,
    };
  });

  // Email options
  const mailOptions = {
    from: 'bakangmonei2@gmail.com',
    to: to,
    subject: subject,
    text: text,
    attachments: parsedAttachments,
  };

  try {
    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
