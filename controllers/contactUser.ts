import { Request, Response, Router } from 'express';
import nodemailer from 'nodemailer';
import IContact from '../interfaces/IContact';
const contactUserRouter = Router();

contactUserRouter.post('/', (req: Request, res: Response) => {
  const {
    userFirstname,
    userLastname,
    userEmail,
    userPhone,
    userSubject,
    userMessage,
  } = req.body as IContact;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'mickaelcharp@gmail.com',
    to: process.env.EMAIL,
    subject: `[VISITEUR] ${userSubject}`,
    text: `Nouveau message reçu par un visiteur. Voici ses coordonnées :

    Prénom : ${userFirstname}
    Nom : ${userLastname}
    Email: ${userEmail}
    Téléphone : ${userPhone}

    Contenu du message : 

    ${userMessage}`,
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

export default contactUserRouter;
