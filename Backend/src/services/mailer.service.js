const nodemailer = require('nodemailer');

console.log('📦 mailer.js loaded');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

transporter.verify((err) => {
  if (err) {
    console.error('❌ SMTP VERIFY FAILED:', err.message);
  } else {
    console.log('✅ SMTP READY');
  }
});

const sendMail = async ({ to, subject, html }) => {
  console.log('🔥 sendMail called:', to);

  const info = await transporter.sendMail({
    from:process.env.SMTP_MAIL,
    to,
    subject,
    html
  });

  console.log('✅ Email sent:', info.messageId);
};

module.exports = { sendMail };
