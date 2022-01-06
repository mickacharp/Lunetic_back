import { RowDataPacket } from 'mysql2';

export default interface IOpeningHour extends RowDataPacket {
  id_opening_hour: number;
  start_morning: string;
  end_morning: string;
  start_afternoon: string;
  end_afternoon: string;
  id_optician: number;
  id_day: number;
}