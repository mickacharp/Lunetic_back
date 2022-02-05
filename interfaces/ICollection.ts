import { RowDataPacket } from 'mysql2';

export default interface ICollection extends RowDataPacket {
  id_collection: number;
  name: string;
}
