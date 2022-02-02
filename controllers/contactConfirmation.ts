import { Request, Response, Router } from 'express';
import nodemailer from 'nodemailer';
import IContact from '../interfaces/IContact';
const contactConfirmationRouter = Router();

contactConfirmationRouter.post('/', (req: Request, res: Response) => {
  const {
    guestFirstname,
    guestEmail,
    guestMessage,
    proFirstname,
    proEmail,
    proMessage,
  } = req.body as IContact;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const firstname = proFirstname === undefined ? guestFirstname : proFirstname;
  const email = proEmail === undefined ? guestEmail : proEmail;
  const message = proMessage === undefined ? guestMessage : proMessage;

  const mailOptions = {
    from: 'mickaelcharp@gmail.com',
    to: `${email}`,
    subject: `[Lunetic] Prise en compte de votre demande`,
    text: `Bonjour ${firstname}, nous avons bien reçu votre message.
    Nous traiterons votre demande dans les plus brefs délais.
    Bonne journée.
    L'équipe Lunetic

    Rappel du contenu de votre message : 

    ${message}`,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

  res.status(200).send();
});

export default contactConfirmationRouter;
