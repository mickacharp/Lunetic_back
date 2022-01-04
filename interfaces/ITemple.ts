import { RowDataPacket } from 'mysql2';

export default interface ITemple extends RowDataPacket {
  id_temple: number;
  name: string;
  id_collection: number;
}
