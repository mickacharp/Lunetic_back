import { RowDataPacket } from 'mysql2';

export default interface IModel extends RowDataPacket {
  id_temple: number;
  name: string;
  id_collection: number;
}
