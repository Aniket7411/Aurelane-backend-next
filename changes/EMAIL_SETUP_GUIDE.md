# 📧 Complete Email Setup Guide

## 🎯 Goal: Get Password Reset Emails Working

Follow these steps to configure email sending in your backend.

---

## 📋 Step 1: Create .env File

Create a `.env` file in your project root with the following content:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/jewellery

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# JWT Expiration
JWT_EXPIRE=7d

# Email Configuration (REQUIRED FOR EMAIL SENDING)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=https://auralaneweb.vercel.app
```

---

## 🔐 Step 2: Gmail Setup (Recommended)

### Option A: Gmail with App Password (Easiest)

1. **Enable 2-Factor Authentication**:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Turn on 2-Step Verification

2. **Generate App Password**:
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" as the app
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

3. **Update .env file**:
   ```bash
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=abcdefghijklmnop  # Use the 16-character app password
   ```

### Option B: Other Email Providers

#### Outlook/Hotmail
```bash
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your_email@outlook.com
EMAIL_PASS=your_password
```

#### Yahoo
```bash
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your_email@yahoo.com
EMAIL_PASS=your_app_password
```

---

## 🚀 Step 3: Test Email Configuration

1. **Restart your server**:
   ```bash
   npm start
   # or
   node server.js
   ```

2. **Test password reset**:
   - Go to your frontend or use Postman
   - Send POST request to `/api/auth/forgot-password`
   - Body: `{"email": "your_email@gmail.com"}`

3. **Check console logs**:
   You should see:
   ```
   📧 Attempting to send email...
   🔍 Verifying email connection...
   ✅ Email connection verified successfully!
   📤 Sending email to: your_email@gmail.com
   ✅ Email sent successfully! Message ID: <message_id>
   ```

---

## 🔧 Step 4: Troubleshooting

### If you see "Email not configured":
- Check that `.env` file exists
- Verify `EMAIL_USER` and `EMAIL_PASS` are set
- Restart the server after adding environment variables

### If you see "Email connection failed":
- Verify your email credentials
- For Gmail: Make sure you're using App Password, not regular password
- Check if 2FA is enabled for Gmail

### If you see "Email sent but not received":
- Check spam/junk folder
- Verify email address is correct
- Wait a few minutes (email delivery can be delayed)

---

## 📧 Step 5: Email Template Preview

Your emails will now look professional with:
- 💎 Aurelane Gems branding
- Beautiful gradient design
- Clear call-to-action button
- Security warnings
- Mobile-responsive layout

---

## ✅ Success Indicators

When working correctly, you'll see:
1. **Console**: "✅ Email sent successfully!"
2. **Response**: `{"success": true, "message": "Password reset email sent successfully! Check your inbox."}`
3. **Email**: Professional-looking password reset email in your inbox

---

## 🆘 Need Help?

### Common Issues:

1. **"Invalid login"**: Wrong email/password
2. **"Connection timeout"**: Check internet/firewall
3. **"Authentication failed"**: Use App Password for Gmail
4. **"Email not found"**: Check email address spelling

### Quick Test:
```bash
# Test with curl
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "your_email@gmail.com"}'
```

---

## 🎉 You're All Set!

Once configured, your users will receive beautiful, professional password reset emails! 

**Next Steps:**
1. Create `.env` file with your email credentials
2. Restart the server
3. Test password reset functionality
4. Check your inbox! 📬
