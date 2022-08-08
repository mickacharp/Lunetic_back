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
      res.status(502).send(error);
      console.log(error);
    } else {
      res.status(200).send(info.response);
    }
  });
});

export default contactProRouter;
