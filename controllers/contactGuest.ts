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
    host: 'something.yourdomain.com',
    port: 123456789,
    secure: true, // true for 123456789, false for other ports
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'contact@lunetic.fr',
    to: 'contact@lunetic.fr',
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
