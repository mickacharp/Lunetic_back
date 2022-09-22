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

  const mailOptions = {
    from: `${process.env.EMAIL}`,
    to: `${process.env.EMAIL}`,
    subject: `[VISITEUR] ${guestSubject}`,
    text: `Nouveau message reçu par un visiteur. Voici ses coordonnées :

    Prénom : ${guestFirstname}
    Nom : ${guestLastname}
    Email: ${guestEmail}
    Téléphone : ${guestPhone}

    ______________
    Contenu du message : 

    ${guestMessage}`,
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

export default contactGuestRouter;
