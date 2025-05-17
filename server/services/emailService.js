// services/emailService.js
import nodemailer from "nodemailer";
import crypto from "crypto";
import User from "../models/user.model.js";
import Address from "../models/address.model.js";

class EmailService {
  constructor() {
    console.log("Email service initializing with:", {
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === "true" || false,
      user: process.env.EMAIL_USER || "your.email@gmail.com",
    });

    // Create reusable transporter object using SMTP
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === "true" || false,
      auth: {
        user: process.env.EMAIL_USER || "your.email@gmail.com",
        pass: process.env.EMAIL_PASS || "your_app_password",
      },
      // TLS settings for Gmail
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === "production",
      },
    });
  }

  /**
   * Generate a secure random password
   * @param {number} length - Length of password (default: 12)
   * @returns {string} Random password
   */
  generateRandomPassword(length = 12) {
    const uppercaseChars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lowercaseChars = "abcdefghijkmnopqrstuvwxyz";
    const numberChars = "23456789";
    const specialChars = "!@#$%^&*-_=+";

    const allChars =
      uppercaseChars + lowercaseChars + numberChars + specialChars;
    let password = "";

    password += uppercaseChars.charAt(
      Math.floor(crypto.randomInt(uppercaseChars.length))
    );
    password += lowercaseChars.charAt(
      Math.floor(crypto.randomInt(lowercaseChars.length))
    );
    password += numberChars.charAt(
      Math.floor(crypto.randomInt(numberChars.length))
    );
    password += specialChars.charAt(
      Math.floor(crypto.randomInt(specialChars.length))
    );

    for (let i = 4; i < length; i++) {
      password += allChars.charAt(
        Math.floor(crypto.randomInt(allChars.length))
      );
    }

    return password
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");
  }

  /**
   * Send welcome email with generated password
   * @param {Object} options - Email options
   * @param {string} options.email - Recipient email
   * @param {string} options.fullName - Recipient name
   * @param {string} options.password - Generated password
   * @returns {Promise<Object>} Send result
   */
  async sendWelcomeEmail({ email, fullName, password }) {
    const mailOptions = {
      from: `"Computer Store" <${
        process.env.EMAIL_FROM || "noreply@example.com"
      }>`,
      to: email,
      subject: "Welcome to Computer Store - Your Account Details",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Welcome to Computer Store!</h2>
          <p>Hello ${fullName},</p>
          <p>Thank you for registering with Computer Store. Your account has been created successfully.</p>
          <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Temporary Password:</strong> ${password}</p>
          </div>
          <p style="color: #777;">For security reasons, we recommend changing your password after logging in for the first time.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${
              process.env.CLIENT_URL || "http://localhost:3000"
            }/login" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to Your Account</a>
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #999; text-align: center;">
            If you didn't create this account, please ignore this email or contact our support team.
          </p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent: %s", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Error sending email:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send welcome email for new user or guest checkout user
   * @param {Object} options - Email options
   * @param {string} options.email - User email address
   * @param {string} options.fullName - User's full name
   * @param {string} options.password - Temporary password for guest users
   * @param {boolean} options.isGuestCheckout - Whether this is a guest checkout account
   * @returns {Promise<Object>} Send result
   */
  async sendWelcomeEmail({
    email,
    fullName,
    password,
    isGuestCheckout = false,
  }) {
    const subject = isGuestCheckout
      ? "Your TechStore Account Has Been Created"
      : "Welcome to TechStore";

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc3545;">${
            isGuestCheckout ? "Your TechStore Account" : "Welcome to TechStore"
          }</h1>
        </div>
        
        <p>Hello ${fullName},</p>
        
        ${
          isGuestCheckout
            ? `<p>Thank you for your recent purchase at TechStore! We've automatically created an account for you to make tracking your orders easier.</p>`
            : `<p>Thank you for creating an account with TechStore! We're excited to have you join our community.</p>`
        }
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Your login details:</strong></p>
          <p>Email: ${email}</p>
          <p>Temporary Password: ${password}</p>
        </div>
        <p>For security reasons, we recommend changing your password after your first login.</p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${
            process.env.CLIENT_URL
          }/login" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Log into Your Account
          </a>
        </div>
        
        <p>If you have any questions or need assistance, please don't hesitate to contact our customer support team.</p>
        
        <p>Thanks,<br>The TechStore Team</p>
      </div>
    `;

    const mailOptions = {
      from: `"TechStore" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject,
      html: htmlContent,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${email}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send order confirmation email
   * @param {Object} order - Order details
   * @returns {Promise<Object>} Send result
   */
  async sendOrderConfirmationEmail(order) {
    const mailOptions = {
      from: `"Computer Store" <${
        process.env.EMAIL_FROM || "noreply@example.com"
      }>`,
      to: order.email,
      subject: `Order Confirmation #${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Order Confirmation</h2>
          <p>Hello ${order.fullName},</p>
          <p>Thank you for your order. We are pleased to confirm that your order has been received and is being processed.</p>
          <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Order Number:</strong> ${
              order.orderNumber
            }</p>
            <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(
              order.createdAt
            ).toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₫${order.total.toLocaleString()}</p>
          </div>
          <h3 style="margin-top: 30px;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Product</th>
                <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Quantity</th>
                <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (item) => `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd;">${
                    item.productName
                  } - ${item.variantName}</td>
                  <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${
                    item.quantity
                  }</td>
                  <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">₫${item.price.toLocaleString()}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right;"><strong>Subtotal:</strong></td>
                <td style="padding: 10px; text-align: right;">₫${order.subtotal.toLocaleString()}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right;"><strong>Shipping:</strong></td>
                <td style="padding: 10px; text-align: right;">₫${order.shippingFee.toLocaleString()}</td>
              </tr>
              ${
                order.discountAmount > 0
                  ? `
                <tr>
                  <td colspan="2" style="padding: 10px; text-align: right;"><strong>Discount:</strong></td>
                  <td style="padding: 10px; text-align: right;">-₫${order.discountAmount.toLocaleString()}</td>
                </tr>
              `
                  : ""
              }
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
                <td style="padding: 10px; text-align: right; font-weight: bold;">₫${order.total.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
          <div style="margin-top: 30px;">
            <h3>Shipping Address</h3>
            <p>${order.shippingAddress.fullName}<br>
            ${order.shippingAddress.addressLine1}<br>
            ${
              order.shippingAddress.addressLine2
                ? order.shippingAddress.addressLine2 + "<br>"
                : ""
            }
            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${
        order.shippingAddress.postalCode
      }<br>
            ${order.shippingAddress.country}</p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${
              process.env.CLIENT_URL || "http://localhost:3000"
            }/orders/${
        order._id
      }" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Your Order</a>
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #999; text-align: center;">
            Thank you for shopping with us!
          </p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("Order confirmation email sent: %s", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Error sending order confirmation email:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Register a new user with email and auto-generated password
   * @param {Object} userData - User data including email, fullName, and address
   * @returns {Promise<Object>} Registration result
   */
  async registerUser(userData) {
    const { email, fullName, address } = userData;

    try {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        // If user exists but doesn't have a password (social login or guest checkout),
        // we can send a password reset link instead
        if (!existingUser.passwordHash) {
          // Generate password reset token
          const resetToken = crypto.randomBytes(32).toString("hex");
          const resetTokenExpires = Date.now() + 3600000; // 1 hour

          existingUser.resetPasswordToken = resetToken;
          existingUser.resetPasswordExpires = resetTokenExpires;
          await existingUser.save();

          // TODO: Send password reset email

          return {
            userId: existingUser._id,
            message:
              "User already exists. A password reset link has been sent to your email.",
          };
        }

        return { error: "Email already in use", status: 400 };
      }

      // Generate a random password
      const password = this.generateRandomPassword();

      // Create new user
      const user = new User({
        email,
        fullName,
        passwordHash: password, // Will be hashed in pre-save hook
        status: "active",
        role: "customer",
      });

      await user.save();

      // Create user's address
      const userAddress = new Address({
        userId: user._id,
        fullName: address.fullName || fullName,
        phoneNumber: address.phoneNumber,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || "",
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        isDefault: true, // First address is default
      });

      await userAddress.save();

      // Send welcome email with password
      await this.sendWelcomeEmail({
        email,
        fullName,
        password, // Pass the password for all registrations
        isGuestCheckout: false, // Explicitly set this for clarity
      });

      return {
        userId: user._id,
        message: "Registration successful. Check your email for login details.",
      };
    } catch (error) {
      console.error("Error in user registration:", error);
      throw error;
    }
  }

  /**
   * Send password reset email with token
   * @param {Object} options - Email options
   * @param {string} options.email - Recipient email
   * @param {string} options.resetToken - Password reset token
   * @param {string} options.fullName - Recipient name
   * @returns {Promise<Object>} Send result
   */
  async sendPasswordResetEmail({ email, resetToken, fullName }) {
    const resetUrl = `${
      process.env.CLIENT_URL || "http://localhost:3000"
    }/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"Computer Store" <${
        process.env.EMAIL_FROM || "noreply@example.com"
      }>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Password Reset</h2>
          <p>Hello ${fullName},</p>
          <p>We received a request to reset your password. Please click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Your Password</a>
          </div>
          <p>If you did not request a password reset, please ignore this email or contact our support if you have concerns.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #999; text-align: center;">
            This link will expire in 1 hour for security reasons.
          </p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("Password reset email sent: %s", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Error sending password reset email:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send order confirmation email
   * @param {Object} order - Order details
   * @returns {Promise<Object>} Send result
   */
  async sendOrderConfirmationEmail(order) {
    const mailOptions = {
      from: `"Computer Store" <${
        process.env.EMAIL_FROM || "noreply@example.com"
      }>`,
      to: order.email,
      subject: `Order Confirmation #${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Order Confirmation</h2>
          <p>Hello ${order.fullName},</p>
          <p>Thank you for your order. We are pleased to confirm that your order has been received and is being processed.</p>
          <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Order Number:</strong> ${
              order.orderNumber
            }</p>
            <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(
              order.createdAt
            ).toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₫${order.total.toLocaleString()}</p>
          </div>
          <h3 style="margin-top: 30px;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Product</th>
                <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Quantity</th>
                <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (item) => `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd;">${
                    item.productName
                  } - ${item.variantName}</td>
                  <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${
                    item.quantity
                  }</td>
                  <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">₫${item.price.toLocaleString()}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right;"><strong>Subtotal:</strong></td>
                <td style="padding: 10px; text-align: right;">₫${order.subtotal.toLocaleString()}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right;"><strong>Shipping:</strong></td>
                <td style="padding: 10px; text-align: right;">₫${order.shippingFee.toLocaleString()}</td>
              </tr>
              ${
                order.discountAmount > 0
                  ? `
                <tr>
                  <td colspan="2" style="padding: 10px; text-align: right;"><strong>Discount:</strong></td>
                  <td style="padding: 10px; text-align: right;">-₫${order.discountAmount.toLocaleString()}</td>
                </tr>
              `
                  : ""
              }
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
                <td style="padding: 10px; text-align: right; font-weight: bold;">₫${order.total.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
          <div style="margin-top: 30px;">
            <h3>Shipping Address</h3>
            <p>${order.shippingAddress.fullName}<br>
            ${order.shippingAddress.addressLine1}<br>
            ${
              order.shippingAddress.addressLine2
                ? order.shippingAddress.addressLine2 + "<br>"
                : ""
            }
            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${
        order.shippingAddress.postalCode
      }<br>
            ${order.shippingAddress.country}</p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${
              process.env.CLIENT_URL || "http://localhost:3000"
            }/orders/${
        order._id
      }" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Your Order</a>
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #999; text-align: center;">
            Thank you for shopping with us!
          </p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("Order confirmation email sent: %s", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Error sending order confirmation email:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send order status update email
   * @param {Object} options - Email options
   * @param {string} options.email - Recipient email
   * @param {string} options.orderNumber - Order number
   * @param {string} options.status - New order status
   * @param {string} options.fullName - Recipient name
   * @returns {Promise<Object>} Send result
   */
  async sendOrderStatusUpdate({ email, orderNumber, status, fullName }) {
    // Create status-specific messaging
    let statusTitle = "Order Status Update";
    let statusMessage = "Your order status has been updated.";
    let statusColor = "#4CAF50"; // Default green

    switch (status) {
      case "confirmed":
        statusTitle = "Order Confirmed";
        statusMessage =
          "Great news! Your order has been confirmed and is now being processed. We'll let you know once it ships.";
        statusColor = "#4CAF50"; // Green
        break;
      case "processing":
        statusTitle = "Order Processing";
        statusMessage =
          "Your order is now being processed. We're getting your items ready for shipment.";
        statusColor = "#2196F3"; // Blue
        break;
      case "shipping":
        statusTitle = "Order Shipped";
        statusMessage =
          "Your order is on the way! It has been shipped and is now on its way to you.";
        statusColor = "#FF9800"; // Orange
        break;
      case "delivered":
        statusTitle = "Order Delivered";
        statusMessage =
          "Your order has been delivered! We hope you enjoy your purchase.";
        statusColor = "#4CAF50"; // Green
        break;
      case "cancelled":
        statusTitle = "Order Cancelled";
        statusMessage =
          "Your order has been cancelled. If you did not request this cancellation, please contact our customer support.";
        statusColor = "#F44336"; // Red
        break;
    }

    const mailOptions = {
      from: `"Computer Store" <${
        process.env.EMAIL_FROM || "noreply@example.com"
      }>`,
      to: email,
      subject: `${statusTitle} - Order #${orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: ${statusColor}; text-align: center;">${statusTitle}</h2>
          <p>Hello ${fullName},</p>
          <p>${statusMessage}</p>
          <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Order Number:</strong> ${orderNumber}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${
        status.charAt(0).toUpperCase() + status.slice(1)
      }</span></p>
            <p style="margin: 5px 0;"><strong>Updated:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${
              process.env.CLIENT_URL || "http://localhost:3000"
            }/orders/${orderNumber}" 
               style="background-color: ${statusColor}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Order Details
            </a>
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #999; text-align: center;">
            Thank you for shopping with us!
          </p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Order status update email sent: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Error sending order status update email:", error);
      return { success: false, error: error.message };
    }
  }
}

// Create and export a singleton instance
const emailService = new EmailService();
export default emailService;
