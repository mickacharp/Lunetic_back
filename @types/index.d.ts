import ICollection from '..interfaces/ICollection';
import IColor from '..interfaces/IColor';
import IDay from '..interfaces/IDay';
import IModel from '..interfaces/IModel';
import IModelTempleColor from '..interfaces/IModelTempleColor';
import INews from '..interfaces/INews';
import IOpeningHour from '..interfaces/ICollection';
import IOptician from '..interfaces/IOptician';
import IOpticianInfo from '../interfaces/IOpticianInfo';
import IOrders from '..interfaces/IOrders';
import ITemple from '..interfaces/ITemple';
import IWishlist from '..interfaces/IWishlist';

declare global {
  namespace Express {
    interface Request {
      opticianInfo?: IOpticianInfo;
      record?:
        | ICollection
        | IColor
        | IDay
        | IModel
        | IModelTempleColor
        | INews
        | IOpeningHour
        | IOptician
        | IOpticianInfo
        | IOrders
        | ITemple
        | IWishlist; // used to store deleted record to send appropriate responses to react-admin
    }
  }
}
