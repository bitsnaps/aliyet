
import nodemailer from 'nodemailer';
import * as v from 'valibot';

// Rate limiting storage
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 3; // 3 requests per minute

const schema = v.object({
  name: v.pipe(v.string(), v.minLength(2)),
  email: v.pipe(v.string(), v.email()),
  tel: v.pipe(v.string(), v.minLength(8)),
  subject: v.pipe(v.string(), v.minLength(1)),
  company: v.optional(v.string()),
  jobTitle: v.optional(v.string()),
  message: v.pipe(v.string(), v.minLength(10))
});

// Dev/Test email using Ethereal (returns preview URL)
async function sendEmailWithEthereal(mailOptions) {
  const account = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass
    }
  });
  const info = await transporter.sendMail(mailOptions);
  const previewUrl = nodemailer.getTestMessageUrl(info);
  return { info, previewUrl };
}

export default defineEventHandler(async (event) => {
 try {
  // 1. Rate Limiting
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown';
  const now = Date.now();
  const userRequests = rateLimit.get(ip) || [];

  // Filter out old requests
  const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: 'Please wait before sending another message.'
    });
  }
  
  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);

  // 2. Validation
  const body = await readBody(event);
  let data;
  try {
    data = v.parse(schema, body);
  } catch (err) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      data: err.issues
    });
  }

  // 3. Email Sending
  const config = useRuntimeConfig();
  
  // Robustly resolve configuration: runtimeConfig (NUXT_ prefix) -> process.env (cPanel direct)
  const smtpHost = config.smtpHost || process.env.SMTP_HOST;
  const smtpPort = config.smtpPort || process.env.SMTP_PORT;
  const smtpUser = config.smtpUser || process.env.SMTP_USER;
  const smtpPass = config.smtpPass || process.env.SMTP_PASS;
  const smtpFrom = config.smtpFrom || process.env.SMTP_FROM;
  const contactEmail = config.contactEmail || process.env.CONTACT_EMAIL;

  const mailOptions = {
    from: `"${data.name}" <${smtpFrom || smtpUser}>`, // Sender address
    replyTo: data.email,
    to: contactEmail || smtpUser, // Receiver address
    subject: `[Aliyaat Contact] ${data.subject}`,
    text: `
Name: ${data.name}
Email: ${data.email}
Phone: ${data.tel}
Company: ${data.company || 'N/A'}
Job Title: ${data.jobTitle || 'N/A'}
Subject: ${data.subject}

Message:
${data.message}
    `,
    html: `
<h3>New Contact Message</h3>
<ul>
  <li><strong>Name:</strong> ${data.name}</li>
  <li><strong>Email:</strong> ${data.email}</li>
  <li><strong>Phone:</strong> ${data.tel}</li>
  <li><strong>Company:</strong> ${data.company || 'N/A'}</li>
  <li><strong>Job Title:</strong> ${data.jobTitle || 'N/A'}</li>
  <li><strong>Subject:</strong> ${data.subject}</li>
</ul>
<p><strong>Message:</strong></p>
<pre style="font-family: sans-serif;">${data.message}</pre>
    `
  };

  // Dev/Test: use Ethereal test account
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { info, previewUrl } = await sendEmailWithEthereal(mailOptions);
      console.log('previewUrl: ', previewUrl);
      console.log('messageId: ', info.messageId);
      return { success: true, message: 'Message received (Dev Mode)' };
    } catch (error) {
      console.error('Ethereal email error:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Email Error',
        message: 'Failed to send email (dev). Please try again later.'
      });
    }
  }

  // Check if email configuration is present
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.error('Missing email configuration. Config:', {
        hasHost: !!smtpHost,
        hasUser: !!smtpUser,
        hasPass: !!smtpPass
    });
    throw createError({
      statusCode: 500,
      statusMessage: 'Server Configuration Error',
      message: 'Email service is not configured properly.'
    });
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(smtpPort) || 587,
    secure: Number(smtpPort) === 465, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail(mailOptions);
  return { success: true, message: 'Message sent successfully' };

 } catch (error) {
    // Catch-all for any unhandled errors in the handler
    console.error('Contact API Error:', error);
    
    // If it's already a H3 error, rethrow it
    if (error.statusCode) {
        throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: error.message || 'An unexpected error occurred.'
    });
 }
});
