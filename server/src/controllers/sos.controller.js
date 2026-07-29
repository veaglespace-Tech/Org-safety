const prisma = require('../config/prisma');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

let transporter;
const setupMail = () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    nodemailer.createTestAccount((err, account) => {
      if (err) {
        console.error('Failed to create a testing account. ' + err.message);
        return;
      }
      transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
          user: account.user,
          pass: account.pass,
        },
      });
      console.log('Ethereal test email account created for SOS endpoint');
    });
  }
};
setupMail();

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.startsWith('AC') && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

exports.triggerSOS = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { locationUrl } = req.body;

    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { organizations: true }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const distressMessage = `🚨 EMERGENCY SOS DISTRESS ALERT 🚨

👤 Name: ${user.name}
📧 Email: ${user.email}
📱 Contact: ${user.phone || 'N/A'}
🆘 Emergency Contact: ${user.emergency_contact || 'N/A'}
🏢 Organisation: ${user.organizations?.name || 'N/A'} (ID: ${user.organization_id})
🖼️ Profile Photo: https://res.cloudinary.com/dbehhnhhi/image/upload/v1782374811/veagle-attendee/profile-images/user-9-1782374808503.jpg

📍 LIVE GPS LOCATION: ${locationUrl || 'Location not provided'}

⚠️ I need immediate assistance! Please verify my safety.`;

    const adminEmails = [];
    if (process.env.GLOBAL_SOS_EMAIL) {
      adminEmails.push(process.env.GLOBAL_SOS_EMAIL);
    }
    
    const admins = await prisma.users.findMany({
      where: {
        organization_id: user.organization_id,
        role: 'admin'
      }
    });

    admins.forEach(a => {
      if (a.email && !adminEmails.includes(a.email)) {
        adminEmails.push(a.email);
      }
    });
    
    const adminPhones = admins.map(a => a.phone).filter(Boolean);
    if (process.env.ADMIN_PHONE && !adminPhones.includes(process.env.ADMIN_PHONE)) {
      adminPhones.push(process.env.ADMIN_PHONE);
    }
    
    const dispatchPhones = [...adminPhones];
    if (user.emergency_contact && !dispatchPhones.includes(user.emergency_contact)) {
      dispatchPhones.push(user.emergency_contact);
    }

    const emailPromise = new Promise(async (resolve) => {
      try {
        if (!transporter) return resolve(false);
        const fromStr = process.env.EMAIL_FROM_NAME && process.env.SMTP_USER 
          ? `"${process.env.EMAIL_FROM_NAME}" <${process.env.SMTP_USER}>` 
          : process.env.SMTP_USER || '"Tich Surksha Alert" <alert@veaglespace.com>';

        const info = await transporter.sendMail({
          from: fromStr,
          to: adminEmails.join(','),
          subject: `🚨 URGENT: SOS Alert from ${user.name}`,
          text: distressMessage,
          html: distressMessage.replace(/\n/g, '<br>')
        });
        console.log("SOS Email sent: %s", info.messageId);
        
        if (nodemailer.getTestMessageUrl(info)) {
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
        resolve(true);
      } catch (err) {
        console.error("SOS Email Error:", err);
        resolve(false);
      }
    });

    const whatsappPromise = new Promise(async (resolve) => {
      try {
        if (!twilioClient || !process.env.TWILIO_WHATSAPP_NUMBER || dispatchPhones.length === 0) {
          console.log("Skipping WhatsApp: Missing Twilio credentials or dispatch phone numbers.");
          return resolve(false);
        }
        
        for (const phone of dispatchPhones) {
           await twilioClient.messages.create({
             body: distressMessage,
             from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
             to: `whatsapp:${phone}`
           });
        }
        console.log("SOS WhatsApp message sent to dispatch phones");
        resolve(true);
      } catch (err) {
        console.error("SOS WhatsApp Error:", err);
        resolve(false);
      }
    });

    const phonePromise = new Promise(async (resolve) => {
      try {
         if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER || dispatchPhones.length === 0) {
           console.log("Skipping Voice Call: Missing Twilio credentials or dispatch phone numbers.");
           return resolve(false);
         }
         
         const twiml = new twilio.twiml.VoiceResponse();
         twiml.say({ voice: 'alice' }, `Emergency S O S Distress Alert. ${user.name} has pressed the S O S button. Please check your WhatsApp and Email immediately for their live G P S location. I repeat, ${user.name} needs immediate assistance.`);
         
         for (const phone of dispatchPhones) {
           await twilioClient.calls.create({
             twiml: twiml.toString(),
             to: phone,
             from: process.env.TWILIO_PHONE_NUMBER
           });
         }
         console.log("SOS Phone call initiated to dispatch phones");
         resolve(true);
      } catch (err) {
        console.error("SOS Phone Call Error:", err);
        resolve(false);
      }
    });

    await Promise.all([emailPromise, whatsappPromise, phonePromise]);
    res.status(200).json({ message: "SOS Distress Dispatched via all available channels." });
  } catch (error) {
    console.error("SOS Trigger Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateSOS = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { locationUrl } = req.body;

    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { organizations: true }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const adminEmails = [];
    if (process.env.GLOBAL_SOS_EMAIL) {
      adminEmails.push(process.env.GLOBAL_SOS_EMAIL);
    }
    
    const admins = await prisma.users.findMany({
      where: {
        organization_id: user.organization_id,
        role: 'admin'
      }
    });

    admins.forEach(a => {
      if (a.email && !adminEmails.includes(a.email)) {
        adminEmails.push(a.email);
      }
    });
    
    if (transporter && adminEmails.length > 0) {
      const updateMessage = `🚨 EMERGENCY SOS UPDATE 🚨

👤 Name: ${user.name}
📞 Phone: ${user.phone || 'Not provided'}
🚨 Emergency Contact: ${user.emergency_contact || 'Not provided'}
🏢 Organization: ${user.organizations?.name || 'N/A'}

⚠️ THIS IS AN AUTOMATED ${process.env.SOS_INTERVAL_MINUTES || '5'}-MINUTE UPDATE.
The user is STILL in an active emergency and has not marked themselves as safe.

📍 LATEST LIVE LOCATION: ${locationUrl || 'Location not available'}
`;
      await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || 'SOS System'}" <${process.env.SMTP_USER}>`,
        to: adminEmails.join(','),
        subject: `🚨 SOS UPDATE: ${user.name} is still in danger`,
        text: updateMessage,
      });
    }

    res.status(200).json({ message: "SOS location update sent successfully" });
  } catch (error) {
    console.error("SOS Update Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.stopSOS = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { organizations: true }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "SOS cancelled successfully" });
  } catch (error) {
    console.error("SOS Stop Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
