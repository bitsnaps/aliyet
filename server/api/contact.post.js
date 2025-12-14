
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

export default defineEventHandler(async (event) => {
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
  // Check if email configuration is present
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, CONTACT_EMAIL } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('Missing email configuration. Email not sent.');
    // In dev, we might want to just log it, but for now lets return success to simulate
    if (process.env.NODE_ENV !== 'production') {
      console.log('--- EMAIL MOCK ---');
      console.log('To:', CONTACT_EMAIL || 'admin@example.com');
      console.log('Subject:', `New Contact: ${data.subject}`);
      console.log('Body:', data);
      console.log('------------------');
      return { success: true, message: 'Message received (Dev Mode)' };
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Server Configuration Error',
      message: 'Email service is not configured.'
    });
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"${data.name}" <${SMTP_FROM || SMTP_USER}>`, // Sender address
    replyTo: data.email,
    to: CONTACT_EMAIL || SMTP_USER, // Receiver address
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

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Message sent successfully' };
  } catch (error) {
    console.error('Email sending error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Email Error',
      message: 'Failed to send email. Please try again later.'
    });
  }
});
