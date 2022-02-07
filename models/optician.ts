import connection from '../db-config';
import Joi from 'joi';
import argon2, { Options } from 'argon2';
import { ResultSetHeader } from 'mysql2';
import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../helpers/errors';
import IOptician from '../interfaces/IOptician';
const NodeGeocoder: Function = require('node-geocoder');
import apiKey from '../api';

//////////// Password Hashing /////////////
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

//////////// function will translate address & zipcode into lat-lng /////////////
const getGeocode = (address: string, zipcode: number) => {
  const options = {
    provider: 'google',

    // Optional depending on the providers
    apiKey: apiKey,
    formatter: null, // 'gpx', 'string', ...
  };
  const geocoder = NodeGeocoder(options);

  return geocoder.geocode({
    address: address,
    country: 'France',
    zipcode: zipcode,
  });
};

//////////// Optician middlewares /////////////
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
    lat: Joi.number().optional(),
    lng: Joi.number().optional(),
    admin: Joi.number().min(0).max(1).optional(),
    id_optician: Joi.number().optional(),
    id: Joi.number().optional(),
  }).validate(req.body, { abortEarly: false }).error;
  if (errors) {
    next(new ErrorHandler(422, errors.message));
  } else {
    next();
  }
};

const emailIsFree = (req: Request, res: Response, next: NextFunction) => {
  const optician = req.body as IOptician;
  getByEmail(optician.email).then((opticianExists: IOptician) => {
    if (opticianExists) {
      next(new ErrorHandler(409, `This optician already exists`));
    } else {
      next();
    }
  });
};

const opticianExists = (req: Request, res: Response, next: NextFunction) => {
  const { id_optician } = req.params;
  getById(Number(id_optician)).then((opticianExists: IOptician) => {
    if (!opticianExists) {
      next(new ErrorHandler(404, `This optician doesn't exist`));
    } else {
      req.record = opticianExists; // because we need deleted record to be sent after a delete in react-admin
      next();
    }
  });
};

//////////// CRUD models of optician /////////////
const getAllOpticians = (sortBy = ''): Promise<IOptician[]> => {
  let sql = 'SELECT *, id_optician as id FROM opticians';
  if (sortBy) {
    sql += ` ORDER BY ${sortBy}`;
  }
  return connection
    .promise()
    .query<IOptician[]>(sql)
    .then(([results]) => results);
};

const getById = (id_optician: number): Promise<IOptician> => {
  return connection
    .promise()
    .query<IOptician[]>(
      'SELECT *, id_optician as id FROM opticians WHERE id_optician = ?',
      [id_optician]
    )
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

  const result = await getGeocode(optician.address, optician.postal_code);
  const lat: number = result[0].latitude as number;
  const lng: number = result[0].longitude as number;

  return connection
    .promise()
    .query<ResultSetHeader>(
      'INSERT INTO opticians (firstname, lastname,company, address, other_address, postal_code, city, email, mobile_phone, password, website, home_phone, finess_code, siret, vat_number, link_picture, lat, lng, admin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
        lat,
        lng,
        optician.admin,
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
        website,
        home_phone,
        finess_code,
        siret,
        vat_number,
        link_picture,
        admin,
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
        lat,
        lng,
        admin,
      };
    });
};

const updateOptician = async (
  id_optician: number,
  optician: IOptician
): Promise<boolean> => {
  let sql = 'UPDATE opticians SET';
  const sqlValues: (string | number)[] = [];
  let oneValue = false;

  if (optician.address || optician.postal_code) {
    const result = await getGeocode(optician.address, optician.postal_code);
    const lat: number = result[0].latitude;
    const lng: number = result[0].longitude;
    sql += ' lat = ? ';
    sqlValues.push(lat);
    sql += oneValue ? ', lng = ? ' : ', lng=?';
    sqlValues.push(lng);
    oneValue = true;
  }

  if (optician.firstname) {
    sql += oneValue ? ', firstname = ? ' : ', firstname = ?';
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
  if (optician.admin) {
    sql += oneValue ? ', admin = ? ' : ' admin = ? ';
    sqlValues.push(optician.admin);
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
  getAllOpticians,
  addOptician,
  getByEmail,
  getById,
  deleteOptician,
  updateOptician,
  emailIsFree,
  opticianExists,
};
