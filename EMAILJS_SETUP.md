# EmailJS Setup Guide

This guide will help you set up EmailJS to send emails directly from your portfolio's contact forms.

## 1. Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account (up to 200 emails/month)
3. Verify your email address

## 2. Add Email Service

1. In your EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider:
   - **Gmail** (recommended for personal use)
   - **Outlook**
   - **Yahoo**
   - **Custom SMTP** (for business domains)

### Gmail Setup (Recommended)
1. Select **Gmail**
2. Click **Connect Account**
3. Sign in with your Gmail account
4. Allow EmailJS permissions
5. Your service will be created with a **Service ID** (e.g., `service_gmail_abc123`)

## 3. Create Email Templates

### Template 1: Contact Form Template
1. Go to **Email Templates**
2. Click **Create New Template**
3. Use this template content:

```html
Subject: New Contact Form Submission from {{from_name}}

Hi {{to_name}},

You have a new contact form submission from your portfolio:

📧 Contact Details:
• Name: {{from_name}}
• Email: {{from_email}}
• Phone: {{phone}}
• Company: {{company}}

📝 Project Information:
• Inquiry Type: {{inquiry_type}}
• Subject: {{subject}}
• Budget: {{budget}}
• Timeline: {{timeline}}

💬 Message:
{{message}}

---
Reply directly to this email to respond to {{from_name}}.

Best regards,
Portfolio Contact Form
```

4. Set the **From Name**: `Portfolio Contact Form`
5. Set the **From Email**: `noreply@yourportfolio.com` (or your domain)
6. Set the **Reply To**: `{{reply_to}}`
7. Save the template and note the **Template ID** (e.g., `template_contact_xyz789`)

### Template 2: Onboarding Form Template
1. Create another template for the onboarding form:

```html
Subject: New Project Onboarding Form - {{company_name}}

Hi {{to_name}},

You have a new project onboarding form submission:

🏢 Company Information:
• Company: {{company_name}}
• Contact Person: {{contact_person}}
• Communication Channel: {{communication_channel}}

📋 Business Details:
• Business Description: {{business_description}}
• Target Customer: {{target_customer}}
• Unique Value: {{unique_value}}

🎯 Project Requirements:
• Problem to Solve: {{problem_solving}}
• Core Features: {{core_features}}
• Existing System: {{existing_system}}

💰 Budget & Timeline:
• Budget Range: {{budget_range}}
• Launch Date: {{launch_date}}

🎨 Design Preferences:
• Brand Guide: {{brand_guide}}
• Color Preferences: {{color_preferences}}
• Tone of Voice: {{tone_of_voice}}

---
Reply directly to this email to respond to {{contact_person}}.

Best regards,
Portfolio Onboarding Form
```

2. Save and note the **Template ID** (e.g., `template_onboarding_abc456`)

## 4. Get Your Public Key

1. Go to **Account** → **General**
2. Find your **Public Key** (e.g., `your_public_key_here`)
3. Copy this key

## 5. Configure Your Portfolio App

1. Open `src/services/emailService.js`
2. Replace the configuration with your actual values:

```javascript
const EMAIL_CONFIG = {
  SERVICE_ID: 'service_gmail_abc123',        // Your Gmail service ID
  TEMPLATE_ID: 'template_contact_xyz789',    // Your contact template ID
  PUBLIC_KEY: 'your_public_key_here',       // Your public key
};
```

3. Update the onboarding template ID:
```javascript
// In sendOnboardingEmail function, replace:
'template_onboarding_id' 
// with your actual onboarding template ID:
'template_onboarding_abc456'
```

## 6. Test Your Setup

1. Run your portfolio app
2. Fill out the contact form
3. Check your email inbox for the test message
4. Check the browser console for any errors

## 7. Environment Variables (Optional)

For better security, you can use environment variables:

1. Create a `.env` file in your project root:
```env
REACT_APP_EMAILJS_SERVICE_ID=service_gmail_abc123
REACT_APP_EMAILJS_TEMPLATE_ID=template_contact_xyz789
REACT_APP_EMAILJS_ONBOARDING_TEMPLATE_ID=template_onboarding_abc456
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key_here
```

2. Update `src/services/emailService.js`:
```javascript
const EMAIL_CONFIG = {
  SERVICE_ID: process.env.REACT_APP_EMAILJS_SERVICE_ID || 'service_gmail_abc123',
  TEMPLATE_ID: process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'template_contact_xyz789',
  PUBLIC_KEY: process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'your_public_key_here',
};
```

## 8. Troubleshooting

### Common Issues:

1. **403 Forbidden Error**
   - Check if your public key is correct
   - Verify your domain is allowed in EmailJS settings

2. **Template Not Found**
   - Double-check template IDs
   - Ensure templates are active

3. **Service Not Found**
   - Verify service ID is correct
   - Check if service is connected properly

4. **Gmail Issues**
   - Make sure 2-factor authentication is enabled
   - Check if Less Secure Apps is disabled (good!)

### Testing Steps:
1. Check browser console for errors
2. Verify all IDs are correct
3. Test with a simple message first
4. Check EmailJS dashboard for send logs

## 9. Security Best Practices

1. **Use Environment Variables** for sensitive data
2. **Set Domain Restrictions** in EmailJS dashboard
3. **Enable reCAPTCHA** for additional security
4. **Monitor Usage** to prevent abuse

## 10. Limitations

- **Free Plan**: 200 emails/month
- **Paid Plans**: Available for higher volumes
- **File Attachments**: Not supported with basic templates
- **Rich HTML**: Supported but keep it simple

## 11. Alternative Email Services

If you prefer other solutions:

1. **Formspree** - Form handling service
2. **Netlify Forms** - If hosting on Netlify
3. **Vercel Functions** - Serverless email handling
4. **SendGrid** - Professional email service

## Support

- EmailJS Documentation: https://www.emailjs.com/docs/
- Community Forum: https://community.emailjs.com/
- GitHub Issues: For portfolio-specific problems

---

Once configured, your portfolio will send emails directly from the contact forms without needing a backend server! 