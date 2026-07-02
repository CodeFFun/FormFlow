import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { NODE_EMAIL, NODE_PASS, EMAIL_HOST, EMAIL_PORT } from "../config";

const transportOptions: SMTPTransport.Options = {
  host: EMAIL_HOST,
  port: Number(EMAIL_PORT),
  secure: true,
  auth: {
    user: NODE_EMAIL,
    pass: NODE_PASS,
  },
};

const transporter = nodemailer.createTransport(transportOptions);

export const sendEmail = async (reciever: string, token: string) => {
  const mailData = {
    from: NODE_EMAIL,
    to: reciever,
    subject: "Verify your email address to login to your account",
    text: `This is your verification token: ${token}. Please use this token to verify your email address and log in to your account. The token will only be valid for 5 minutes.`,
  };
    transporter.sendMail(mailData, function (err, info) {
    if (err) console.log(err);
    else console.log(info);
  });
};

export const sendInvitationEmail = async (
  reciever: string,
  params: { orgName: string; acceptUrl: string; token: string }
) => {
  const { orgName, acceptUrl, token } = params;
  const mailData = {
    from: NODE_EMAIL,
    to: reciever,
    subject: `You've been invited to join ${orgName} on FormFlow`,
    text:
      `You've been invited to join the organization "${orgName}" on FormFlow.\n\n` +
      `Accept your invitation by opening this link:\n${acceptUrl}\n\n` +
      `If the link doesn't work, sign in and enter this invitation code:\n${token}\n\n` +
      `This invitation will expire in 7 days.`,
  };
  transporter.sendMail(mailData, function (err, info) {
    if (err) console.log(err);
    else console.log(info);
  });
};

export const sendFormInviteEmail = async (
  reciever: string,
  params: { formTitle: string; fillUrl: string }
) => {
  const { formTitle, fillUrl } = params;
  const mailData = {
    from: NODE_EMAIL,
    to: reciever,
    subject: `You've been invited to fill out "${formTitle}"`,
    text:
      `You've been invited to respond to the form "${formTitle}".\n\n` +
      `Open your personal link to fill it out:\n${fillUrl}\n\n` +
      `This link is tied to your email address.`,
  };
  transporter.sendMail(mailData, function (err, info) {
    if (err) console.log(err);
    else console.log(info);
  });
};
