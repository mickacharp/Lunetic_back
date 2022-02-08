import { RowDataPacket } from 'mysql2';

export default interface IConceptImage extends RowDataPacket {
  id_concept_image: number;
  main_img: string;
  img1: string;
  img2: string;
  left_img3: string;
  right_img3: string;
  video: string;
}
