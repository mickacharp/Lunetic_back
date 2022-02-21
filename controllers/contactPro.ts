import { Request, Response, Router } from 'express';
import nodemailer from 'nodemailer';
import IContact from '../interfaces/IContact';
const contactProRouter = Router();

contactProRouter.post('/', (req: Request, res: Response) => {
  const {
    proFirstname,
    proLastname,
    proCompany,
    proStreetNumber,
    proStreet,
    proCity,
    proPhone,
    proMobilePhone,
    proEmail,
    proSubject,
    proMessage,
  } = req.body as IContact;

  const transporter = nodemailer.createTransport({
    host: 'ssl0.ovh.net',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'contact@lunetic.fr',
    to: 'contact@lunetic.fr',
    subject: `[PRO] ${proSubject}`,
    text: `Nouveau message reçu par un professionnel. Voici ses coordonnées :

    Prénom : ${proFirstname}
    Nom : ${proLastname}
    Société/Magasin : ${proCompany}

    Adresse : ${proStreetNumber} ${proStreet}, ${proCity}
    Téléphone Fixe : ${proPhone}
    Téléphone Mobile : ${proMobilePhone}
    Email : ${proEmail}

    ______________
    Contenu du message : 

    ${proMessage}`,
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

export default contactProRouter;
