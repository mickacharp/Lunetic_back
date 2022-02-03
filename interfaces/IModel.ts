import { RowDataPacket } from 'mysql2';

export default interface IModel extends RowDataPacket {
  id_temple: number;
  name: string;
  id_collection: number;
  main_img: string;
  img_2: string;
  img_3: string;
  img_4: string;
  img_5: string;
  text: string;
}
