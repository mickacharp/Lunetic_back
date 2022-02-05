import { RowDataPacket } from 'mysql2';

export default interface INews extends RowDataPacket {
  id_order: number;
  id_optician: number;
  link_pdf: string;
  order_number: string;
  date: string;
}