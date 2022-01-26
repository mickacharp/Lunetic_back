import { RowDataPacket } from 'mysql2';

export default interface IContact extends RowDataPacket {
  guestFirstname: string;
  guestLastname: string;
  guestEmail: string;
  guestPhone: string;
  guestSubject: string;
  guestMessage: string;

  proFirstname: string;
  proLastname: string;
  proCompany: string;
  proStreetNumber: string;
  proStreet: string;
  proCity: string;
  proPhone: string;
  proMobilePhone: string;
  proEmail: string;
  proSubject: string;
  proMessage: string;
}
