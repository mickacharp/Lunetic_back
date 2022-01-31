import { RowDataPacket } from 'mysql2';

export default interface IDay extends RowDataPacket {
  id_day: number;
  name: string;
}
