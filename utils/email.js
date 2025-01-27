const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Tour Bookin Website <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // MAILTRAP //me
      
      return nodemailer.createTransport({
        host: "live.smtp.mailtrap.io",
        port: 587,
        auth: {
          user: process.env.MAILTRAP_USER,
          pass: process.env.MAILTRAP_PASS
        }
      });
      
      // return nodemailer.createTransport({
      //   host: process.env.EMAIL_HOST,
      //   port: process.env.EMAIL_PORT,
      //   auth: {
      //     user: process.env.EMAIL_USERNAME,
      //     pass: process.env.EMAIL_PASSWORD
      //   }
      // });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // send the actual email
  async send(template, subject) {
    // 1) render HTML based on pug temp
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });
    // 2) define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html) //me
    };

    // 3) create a transport and send
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to TourBooking Website!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your Password reset token.(valid for only 10 miniutes!)'
    );
  }
};

