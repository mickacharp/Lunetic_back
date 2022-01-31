import connection from '../db-config';
import { ResultSetHeader } from 'mysql2';

import IWishlist from '../interfaces/IWishlist';

const getAllWishlists = (): Promise<IWishlist[]> => {
  return connection
    .promise()
    .query<IWishlist[]>('SELECT * FROM wishlists')
    .then(([results]) => results);
};

const getWishlistById = (id_wishlist: number): Promise<IWishlist> => {
  return connection
    .promise()
    .query<IWishlist[]>('SELECT * FROM wishlists WHERE id_wishlist = ?', [
      id_wishlist,
    ])
    .then(([results]) => results[0]);
};

const getWishlistsByOptician = (id_optician: number) => {
  return connection
    .promise()
    .query<IWishlist[]>('SELECT * FROM wishlists WHERE id_optician = ?', [
      id_optician,
    ])
    .then(([results]) => results);
};

const addWishlist = (wishlist: IWishlist) => {
  return connection
    .promise()
    .query<ResultSetHeader>(
      'INSERT INTO wishlists (id_optician, name, date) VALUES (?,?,?)',
      [wishlist.id_optician, wishlist.name, wishlist.date]
    )
    .then(([results]) => {
      const id_wishlist = results.insertId;
      const { id_optician, name, date } = wishlist;
      return {
        id_wishlist,
        id_optician,
        name,
        date,
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
  getAllWishlists,
  getWishlistById,
  getWishlistsByOptician,
  addWishlist,
  updateWishlist,
  deleteWishlist,
};
