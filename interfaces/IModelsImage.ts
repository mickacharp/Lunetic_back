import { RowDataPacket } from 'mysql2';

export default interface IModelsImage extends RowDataPacket {
  id_models_image: number;
  main_img1: string;
  main_img2: string;
  main_img3: string;
  main_img4: string;
  sidetitle_img1: string;
  sidetitle_img2: string;
  page_img1: string;
  page_img2: string;
  middle_img1: string;
  middle_img2: string;
  main_bottom_img: string;
  bottom_img1: string;
  bottom_img2: string;
  bottom_img3: string;
}
