import connection from '../db-config';
import Joi from 'joi';
import { ResultSetHeader } from 'mysql2';
import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../helpers/errors';
import IWishlist from '../interfaces/IWishlist';

//////////// Wishlist middlewares /////////////
const validateWishlist = (req: Request, res: Response, next: NextFunction) => {
  let required: Joi.PresenceMode = 'optional';
  if (req.method === 'POST') {
    required = 'required';
  }
  const errors = Joi.object({
    name: Joi.string().max(255).presence(required),
    id_optician: Joi.number().presence(required),
    id_wishlist: Joi.number().optional(),
    id: Joi.number().optional(),
  }).validate(req.body, { abortEarly: false }).error;
  if (errors) {
    next(new ErrorHandler(422, errors.message));
  } else {
    next();
  }
};

const wishlistExists = (req: Request, res: Response, next: NextFunction) => {
  const { id_wishlist } = req.params;
  getWishlistById(Number(id_wishlist)).then((wishlistExists: IWishlist) => {
    if (!wishlistExists) {
      next(new ErrorHandler(404, `This wishlist doesn't exist`));
    } else {
      req.record = wishlistExists; // because we need deleted record to be sent after a delete in react-admin
      next();
    }
  });
};

//////////// CRUD models of wishlist /////////////
const getAllWishlists = (sortBy = ''): Promise<IWishlist[]> => {
  let sql = 'SELECT *, id_wishlist as id FROM wishlists';
  if (sortBy) {
    sql += ` ORDER BY ${sortBy}`;
  }
  return connection
    .promise()
    .query<IWishlist[]>(sql)
    .then(([results]) => results);
};

const getWishlistById = (id_wishlist: number): Promise<IWishlist> => {
  return connection
    .promise()
    .query<IWishlist[]>(
      'SELECT *, id_wishlist as id FROM wishlists WHERE id_wishlist = ?',
      [id_wishlist]
    )
    .then(([results]) => results[0]);
};

const getWishlistsByOptician = (id_optician: number) => {
  return connection
    .promise()
    .query<IWishlist[]>(
      'SELECT *, id_wishlist as id FROM wishlists WHERE id_optician = ?',
      [id_optician]
    )
    .then(([results]) => results);
};

const addWishlist = (wishlist: IWishlist) => {
  return connection
    .promise()
    .query<ResultSetHeader>(
      'INSERT INTO wishlists (id_optician, name) VALUES (?,?)',
      [wishlist.id_optician, wishlist.name]
    )
    .then(([results]) => {
      const id_wishlist = results.insertId;
      const { id_optician, name } = wishlist;
      return {
        id_wishlist,
        id_optician,
        name,
      };
    });
};

const updateWishlist = (
  id_wishlist: number,
  wishlist: IWishlist
): Promise<boolean> => {
  return connection
    .promise()
    .query<ResultSetHeader>(
      `UPDATE wishlists SET name = ? WHERE id_wishlist = ?`,
      [wishlist.name, id_wishlist]
    )
    .then(([results]) => results.affectedRows === 1);
};

const deleteWishlist = (id_wishlist: number): Promise<boolean> => {
  return connection
    .promise()
    .query<ResultSetHeader>('DELETE FROM wishlists WHERE id_wishlist = ?', [
      id_wishlist,
    ])
    .then(([results]) => results.affectedRows === 1);
};

export {
  validateWishlist,
  wishlistExists,
  getAllWishlists,
  getWishlistById,
  getWishlistsByOptician,
  addWishlist,
  updateWishlist,
  deleteWishlist,
};
