import { RowDataPacket } from 'mysql2';

export default interface IContact extends RowDataPacket {
  userFirstname: string;
  userLastname: string;
  userEmail: string;
  userPhone: string;
  userSubject: string;
  userMessage: string;

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
