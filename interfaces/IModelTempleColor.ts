import { RowDataPacket } from 'mysql2';

export default interface IModel extends RowDataPacket {
  id_model_temple_color: number;
  id_color_temple: number;
  id_model: number;
  id_color_model: number;
  id_temple: number;
  id_wishlist: number;
}
