import { RowDataPacket } from 'mysql2';

export default interface IUsImage extends RowDataPacket {
  id_us_image: number;
  main_img: string;
  middle_img: string;
  partners_img: string;
}
