import { RowDataPacket } from 'mysql2';

export default interface INews extends RowDataPacket {
  id_news: number;
  title: string;
  subtitle: string;
  text: string;
  link_picture: string;
}