import connection from '../db-config';
import Joi from 'joi';
import argon2, { Options } from 'argon2';
import { ResultSetHeader } from 'mysql2';
import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../helpers/errors';
import IOptician from '../interfaces/IOptician';

const hashingOptions: Options & { raw?: false } = {
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
  const optician = req.body as IOptician;
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

const opticianExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Récupèrer l'id optician de req.params
  const { id_optician } = req.params;
  // Vérifier si le optician existe
  const opticianExists: IOptician = await getById(Number(id_optician));
  // Si non, => erreur
  if (!opticianExists) {
    next(new ErrorHandler(404, `This optician doesn't exist`));
  }
  // Si oui => next
  else {
    next();
  }
};

const getAllOpticians = (): Promise<IOptician[]> => {
  return connection
    .promise()
    .query<IOptician[]>('SELECT * FROM opticians')
    .then(([results]) => results);
};

const getById = (id_optician: number): Promise<IOptician> => {
  return connection
    .promise()
    .query<IOptician[]>('SELECT * FROM opticians WHERE id_optician = ?', [
      id_optician,
    ])
    .then(([results]) => results[0]);
};

const getByEmail = (email: string): Promise<IOptician> => {
  return connection
    .promise()
    .query<IOptician[]>('SELECT * FROM opticians WHERE email = ?', [email])
    .then(([results]) => results[0]);
};

const addOptician = async (optician: IOptician) => {
  const hashedPassword = await hashPassword(optician.password);
  return connection
    .promise()
    .query<ResultSetHeader>(
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
        hashedPassword,
        optician.website,
        optician.home_phone,
        optician.finess_code,
        optician.siret,
        optician.vat_number,
        optician.link_picture,
      ]
    )
    .then(([results]) => {
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
        hashedPassword,
        website,
        home_phone,
        finess_code,
        siret,
        vat_number,
        link_picture,
      };
    });
};

const updateOptician = async (
  id_optician: number,
  optician: IOptician
): Promise<boolean> => {
  let sql = 'UPDATE opticians SET';
  const sqlValues: Array<string | number> = [];
  let oneValue = false;

  if (optician.firstname) {
    sql += ' firstname = ? ';
    sqlValues.push(optician.firstname);
    oneValue = true;
  }
  if (optician.lastname) {
    sql += oneValue ? ', lastname = ? ' : ' lastname = ? ';
    sqlValues.push(optician.lastname);
    oneValue = true;
  }
  if (optician.company) {
    sql += oneValue ? ', company = ? ' : ' company = ? ';
    sqlValues.push(optician.company);
    oneValue = true;
  }
  if (optician.address) {
    sql += oneValue ? ', address = ? ' : ' address = ? ';
    sqlValues.push(optician.address);
    oneValue = true;
  }
  if (optician.other_address) {
    sql += oneValue ? ', other_address = ? ' : ' other_address = ? ';
    sqlValues.push(optician.other_address);
    oneValue = true;
  }
  if (optician.postal_code) {
    sql += oneValue ? ', postal_code = ? ' : ' postal_code = ? ';
    sqlValues.push(optician.postal_code);
    oneValue = true;
  }
  if (optician.city) {
    sql += oneValue ? ', city = ? ' : ' city = ? ';
    sqlValues.push(optician.city);
    oneValue = true;
  }
  if (optician.email) {
    sql += oneValue ? ', email = ? ' : ' email = ? ';
    sqlValues.push(optician.email);
    oneValue = true;
  }
  if (optician.mobile_phone) {
    sql += oneValue ? ', mobile_phone = ? ' : ' mobile_phone = ? ';
    sqlValues.push(optician.mobile_phone);
    oneValue = true;
  }
  if (optician.password) {
    sql += oneValue ? ', password = ? ' : ' password = ? ';
    const hashedPassword: string = await hashPassword(optician.password);
    sqlValues.push(hashedPassword);
    oneValue = true;
  }
  if (optician.website) {
    sql += oneValue ? ', website = ? ' : ' website = ? ';
    sqlValues.push(optician.website);
    oneValue = true;
  }

  if (optician.home_phone) {
    sql += oneValue ? ', home_phone = ? ' : ' home_phone = ? ';
    sqlValues.push(optician.home_phone);
    oneValue = true;
  }
  if (optician.finess_code) {
    sql += oneValue ? ', finess_code = ? ' : ' finess_code = ? ';
    sqlValues.push(optician.finess_code);
    oneValue = true;
  }
  if (optician.siret) {
    sql += oneValue ? ', siret = ? ' : ' siret = ? ';
    sqlValues.push(optician.siret);
    oneValue = true;
  }
  if (optician.vat_number) {
    sql += oneValue ? ', vat_number = ? ' : ' vat_number = ? ';
    sqlValues.push(optician.vat_number);
    oneValue = true;
  }
  if (optician.link_picture) {
    sql += oneValue ? ', link_picture = ? ' : ' link_picture = ? ';
    sqlValues.push(optician.link_picture);
    oneValue = true;
  }

  sql += ' WHERE id_optician = ?';
  sqlValues.push(id_optician);

  return connection
    .promise()
    .query<ResultSetHeader>(sql, sqlValues)
    .then(([results]) => results.affectedRows === 1);
};

const deleteOptician = (id_optician: number): Promise<boolean> => {
  return connection
    .promise()
    .query<ResultSetHeader>('DELETE FROM opticians WHERE id_optician = ?', [
      id_optician,
    ])
    .then(([results]) => results.affectedRows === 1);
};

export {
  verifyPassword,
  validateOptician,
  validateLogin,
  getAllOpticians,
  addOptician,
  getByEmail,
  getById,
  deleteOptician,
  updateOptician,
  emailIsFree,
  opticianExists,
};
