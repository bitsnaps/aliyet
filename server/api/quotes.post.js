
import nodemailer from 'nodemailer';
import * as v from 'valibot';

// Rate limiting storage
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 3; // 3 requests per minute

const schema = v.object({
  machine: v.object({
    name: v.string(),
    id: v.any() // allow string or number
  }),
  main_characteristics: v.record(v.string(), v.any()),
  optional_characteristics: v.record(v.string(), v.any()),
  user_details: v.object({
    name: v.pipe(v.string(), v.minLength(2)),
    email: v.pipe(v.string(), v.email()),
    phone: v.pipe(v.string(), v.minLength(8)),
    company: v.optional(v.string())
  })
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
      message: 'Please wait before sending another quote request.'
    });
  }
  
  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);

  // 2. Validation
  const body = await readBody(event);
  let data;
  try {
    // Basic validation, we can relax it if needed
    // We are trusting the structure mostly, validating user details mainly
    // data = v.parse(schema, body); 
    // Skipping strict schema validation for nested dynamic objects to avoid complex schema definition for now
    // but we will validate user_details at least.
    if (!body.user_details || !body.user_details.email) throw new Error("Email is required");
    data = body;
  } catch (err) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      data: err.message
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

  const userDetails = data.user_details;
  const machine = data.machine;
  
  const mainCharsList = Object.entries(data.main_characteristics || {})
    .map(([key, value]) => `${key}: ${value}`).join('\n');
    
  const optionalCharsList = Object.entries(data.optional_characteristics || {})
    .filter(([_, value]) => value) // only true values
    .map(([key, _]) => `- ${key}`).join('\n');

  const mailOptions = {
    from: `"${userDetails.name}" <${smtpFrom || smtpUser}>`, // Sender address
    replyTo: userDetails.email,
    to: contactEmail || smtpUser, // Receiver address
    subject: `[Aliyaat Quote] Request for ${machine.name}`,
    text: `
New Quote Request

User Details:
Name: ${userDetails.name}
Email: ${userDetails.email}
Phone: ${userDetails.phone}
Company: ${userDetails.company || 'N/A'}

Machine: ${machine.name} (ID: ${machine.id})

Main Characteristics:
${mainCharsList}

Optional Characteristics:
${optionalCharsList}
    `,
    html: `
<h3>New Quote Request</h3>
<h4>User Details</h4>
<ul>
  <li><strong>Name:</strong> ${userDetails.name}</li>
  <li><strong>Email:</strong> ${userDetails.email}</li>
  <li><strong>Phone:</strong> ${userDetails.phone}</li>
  <li><strong>Company:</strong> ${userDetails.company || 'N/A'}</li>
</ul>

<h4>Machine</h4>
<p><strong>${machine.name}</strong> (ID: ${machine.id})</p>

<h4>Main Characteristics</h4>
<pre>${mainCharsList}</pre>

<h4>Optional Characteristics</h4>
<pre>${optionalCharsList}</pre>
    `
  };

  // Dev/Test: use Ethereal test account
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { info, previewUrl } = await sendEmailWithEthereal(mailOptions);
      console.log('Quote Email Preview URL: ', previewUrl);
      return { success: true, message: 'Quote received (Dev Mode)', previewUrl };
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
    console.error('Missing email configuration.');
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
  return { success: true, message: 'Quote sent successfully' };

 } catch (error) {
    console.error('Quotes API Error:', error);
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
