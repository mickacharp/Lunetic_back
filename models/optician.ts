const connection = require('../db-config');
import IUser from '../interfaces/IUser';
import Joi from 'joi';
import argon2 from 'argon2';
import { ResultSetHeader } from 'mysql2';
import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../helpers/errors';
import IOptician from '../interfaces/IOptician';

const hashingOptions: Object = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 5,
  parallelism: 1,
};

const hashPassword = (password: string) => {
  return argon2.hash(password, hashingOptions);
};

const verifyPassword = (password: string, hashedPassword: string) => {
  return argon2.verify(hashedPassword, password, hashingOptions);
};

const validateOptician = (req: Request, res: Response, next: NextFunction) => {
  let required: Joi.PresenceMode = 'optional';
  if (req.method === 'POST') {
    required = 'required';
  }
  const errors = Joi.object({
    firstname: Joi.string().max(100).presence(required),
    lastname: Joi.string().max(255).presence(required),
    company: Joi.string().max(255).presence(required),
    address: Joi.string().max(255).presence(required),
    other_address: Joi.string().max(255).allow('', null),
    postal_code: Joi.string().max(50).presence(required),
    city: Joi.string().max(255).presence(required),
    email: Joi.string().email().max(255).presence(required),
    mobile_phone: Joi.string().max(50).allow('', null),
    password: Joi.string().min(8).max(100).presence(required),
    website: Joi.string().max(255).allow('', null),
    home_phone: Joi.string().max(50).allow('', null),
    finess_code: Joi.string().max(20).allow('', null),
    siret: Joi.string().max(25).allow('', null),
    vat_number: Joi.string().max(45).allow('', null),
    link_picture: Joi.string().max(255).allow('', null),
  }).validate(req.body, { abortEarly: false }).error;
  if (errors) {
    next(new ErrorHandler(422, errors.message));
  } else {
    next();
  }
};

const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const errors = Joi.object({
    email: Joi.string().email().max(255).required(),
    password: Joi.string().min(8).max(15).required(),
  }).validate(req.body, { abortEarly: false }).error;
  if (errors) {
    next(new ErrorHandler(422, errors.message));
  } else {
    next();
  }
};

const emailIsFree = async (req: Request, res: Response, next: NextFunction) => {
  // Récupèrer l'email dans le req.body
  const optician: IOptician = req.body;
  // Vérifier si l'email appartient déjà à un user
  const opticianExists: IOptician = await getByEmail(optician.email);
  // Si oui => erreur
  if (opticianExists) {
    next(new ErrorHandler(409, `This optician already exists`));
  } else {
    // Si non => next
    next();
  }
};

const userExists = async (req: Request, res: Response, next: NextFunction) => {
  // Récupèrer l'id user de req.params
  const { idUser } = req.params;
  // Vérifier si le user existe
  const userExists: IUser = await getById(Number(idUser));
  // Si non, => erreur
  if (!userExists) {
    next(new ErrorHandler(404, `This user doesn't exist`));
  }
  // Si oui => next
  else {
    next();
  }
};

const getAllOpticians = () => {
  return connection
    .promise()
    .query('SELECT * FROM opticians')
    .then(([results]: Array<IUser>) => results);
};

const getById = (idUser: number) => {
  return connection
    .promise()
    .query('SELECT * FROM opticians WHERE id_optician = ?', [idUser])
    .then(([results]: Array<Array<IUser>>) => results[0]);
};

const getByEmail = (email: string) => {
  return connection
    .promise()
    .query('SELECT * FROM opticians WHERE email = ?', [email])
    .then(([results]: Array<Array<IOptician>>) => results[0]);
};

const addOptician = async (optician: IOptician) => {
  const hashedPassword = await hashPassword(optician.password);
  return connection
    .promise()
    .query(
      'INSERT INTO opticians (firstname, lastname,company, address, other_address, postal_code, city, email, mobile_phone, password, website, home_phone, finess_code, siret, vat_number, link_picture) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        optician.firstname,
        optician.lastname,
        optician.company,
        optician.address,
        optician.other_address,
        optician.postal_code,
        optician.city,
        optician.email,
        optician.mobile_phone,
        optician.password,
        optician.website,
        optician.home_phone,
        optician.finess_code,
        optician.siret,
        optician.vat_number,
        optician.link_picture,
      ]
    )
    .then(([results]: Array<ResultSetHeader>) => {
      const id_optician = results.insertId;
      const {
        firstname,
        lastname,
        company,
        address,
        other_address,
        postal_code,
        city,
        email,
        mobile_phone,
        password,
        website,
        home_phone,
        finess_code,
        siret,
        vat_number,
        link_picture,
      } = optician;
      return {
        id_optician,
        firstname,
        lastname,
        company,
        address,
        other_address,
        postal_code,
        city,
        email,
        mobile_phone,
        password,
        website,
        home_phone,
        finess_code,
        siret,
        vat_number,
        link_picture,
      };
    });
};

const updateUser = async (idUser: number, user: IUser) => {
  let sql: string = 'UPDATE users SET ';
  let sqlValues: Array<any> = [];
  let oneValue: boolean = false;

  if (user.firstname) {
    sql += 'firstname = ? ';
    sqlValues.push(user.firstname);
    oneValue = true;
  }
  if (user.lastname) {
    sql += oneValue ? ', lastname = ? ' : ' lastname = ? ';
    sqlValues.push(user.lastname);
    oneValue = true;
  }
  if (user.email) {
    sql += oneValue ? ', email = ? ' : ' email = ? ';
    sqlValues.push(user.email);
    oneValue = true;
  }
  if (user.password) {
    sql += oneValue ? ', password = ? ' : ' password = ? ';
    const hashedPassword: string = await hashPassword(user.password);
    sqlValues.push(hashedPassword);
    oneValue = true;
  }
  if (user.admin) {
    sql += oneValue ? ', admin = ? ' : ' admin = ? ';
    sqlValues.push(user.admin);
    oneValue = true;
  }
  sql += ' WHERE id_user = ?';
  sqlValues.push(idUser);

  return connection
    .promise()
    .query(sql, sqlValues)
    .then(([results]: Array<ResultSetHeader>) => results.affectedRows === 1);
};

const deleteUser = async (idUser: number) => {
  return connection
    .promise()
    .query('DELETE FROM users WHERE id_user = ?', [idUser])
    .then(([results]: Array<ResultSetHeader>) => results.affectedRows === 1);
};

export {
  verifyPassword,
  validateOptician,
  validateLogin,
  getAllOpticians,
  addOptician,
  getByEmail,
  getById,
  deleteUser,
  updateUser,
  emailIsFree,
  userExists,
};
