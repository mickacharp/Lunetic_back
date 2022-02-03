import { RowDataPacket } from 'mysql2';

export default interface IOptician extends RowDataPacket {
  id_optician: number;
  firstname: string;
  lastname: string;
  company: string;
  address: string;
  other_address: string;
  postal_code: number;
  city: string;
  email: string;
  mobile_phone: string;
  password: string;
  website: string;
  home_phone: string;
  finess_code: string;
  siret: string;
  vat_number: string;
  link_picture: string;
  lat: number;
  lng: number;
  admin: number;
}
