import { RowDataPacket } from 'mysql2';

export default interface ICarousel extends RowDataPacket {
  id_carousel: number;
  img_top1: string;
  img_top2: string;
  img_top3: string;
  img_bottom1: string;
  img_bottom2: string;
  img_bottom3: string;
  video: string;
}
