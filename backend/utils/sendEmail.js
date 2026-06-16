import nodemailer from 'nodemailer';

/**
 * Send an email with SMTP or fall back to logging in development
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Text/HTML message body
 */
const sendEmail = async (options) => {
  const isSmtpConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS;

  if (isSmtpConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail', // or custom SMTP host
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: `"MedConnect Telehealth" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.message
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email successfully sent to ${options.email}`);
      return true;
    } catch (error) {
      console.error(`Error sending email to ${options.email}:`, error);
      // Don't crash the server, fall back to console logging
      console.log('----- MOCK EMAIL LOG -----');
      console.log(`TO: ${options.email}`);
      console.log(`SUBJECT: ${options.subject}`);
      console.log(`BODY: ${options.message}`);
      console.log('---------------------------');
      return false;
    }
  } else {
    // If not configured, print to console as fallback
    console.log('----- MOCK EMAIL LOG (NO SMTP CONFIG) -----');
    console.log(`TO: ${options.email}`);
    console.log(`SUBJECT: ${options.subject}`);
    console.log(`BODY: ${options.message}`);
    console.log('---------------------------------------------');
    return true;
  }
};

export default sendEmail;
