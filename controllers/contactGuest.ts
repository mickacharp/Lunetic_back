import { Request, Response, Router } from 'express';
import nodemailer from 'nodemailer';
import IContact from '../interfaces/IContact';
const contactGuestRouter = Router();

contactGuestRouter.post('/', (req: Request, res: Response) => {
  const {
    guestFirstname,
    guestLastname,
    guestEmail,
    guestPhone,
    guestSubject,
    guestMessage,
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
    subject: `[VISITEUR] ${guestSubject}`,
    text: `Nouveau message reçu par un visiteur. Voici ses coordonnées :

    Prénom : ${guestFirstname}
    Nom : ${guestLastname}
    Email: ${guestEmail}
    Téléphone : ${guestPhone}

    Contenu du message : 

    ${guestMessage}`,
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

export default contactGuestRouter;
