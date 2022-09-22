import { Request, Response, Router } from 'express';
import nodemailer from 'nodemailer';
import IContact from '../interfaces/IContact';
const contactConfirmationRouter = Router();

contactConfirmationRouter.post('/', (req: Request, res: Response) => {
  const { guestEmail, guestMessage, proEmail, proMessage } =
    req.body as IContact;

  // ID POUR LUNETIC
  // const transporter = nodemailer.createTransport({
  //   host: 'ssl0.ovh.net',
  //   port: 465,
  //   secure: true, // true for 465, false for other ports
  //   auth: {
  //     user: process.env.EMAIL,
  //     pass: process.env.EMAIL_PASSWORD,
  //   },
  // });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const email = proEmail === undefined ? guestEmail : proEmail;
  const message = proMessage === undefined ? guestMessage : proMessage;

  const mailOptions = {
    from: `"L'équipe Lunetic" <${process.env.EMAIL}>`,
    to: `${email}`,
    subject: `[Lunetic] Prise en compte de votre demande`,
    text: `Bonjour, nous avons bien reçu votre message.
    Nous traiterons votre demande dans les plus brefs délais.
    Bonne journée.
    L'équipe Lunetic

    ______________
    Rappel du contenu de votre message : 

    ${message}`,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.status(502).send(error);
      console.log(error);
    } else {
      res.status(200).send(info.response);
    }
  });
});

export default contactConfirmationRouter;
