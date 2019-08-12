const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // must create a transporter using nodemailer
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_EMAIL_PW
    }
  });

  // must define our email options using the options passed to this function...
  const emailOptions = {
    from: 'V.P.Test <vpTest@test.com>',
    to: options.to,
    subject: options.subject,
    text: options.text
    // there is an option html option also...
  };

  // send the email (this returns a promise, so await it)
  await transporter.sendMail(emailOptions);
};

module.exports = sendEmail;
