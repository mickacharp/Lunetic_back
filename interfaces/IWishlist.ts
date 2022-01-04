import { RowDataPacket } from 'mysql2';

export default interface IWishlist extends RowDataPacket {
  id_wishlist: number;
  id_optician: number;
  date: Date;
  name: string;
}
