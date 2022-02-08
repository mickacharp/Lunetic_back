import connection from '../db-config';
import Joi from 'joi';
import { ResultSetHeader } from 'mysql2';
import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../helpers/errors';
import ICarousel from '../interfaces/ICarousel';

//////////// Carousel middlewares /////////////
const validateCarousel = (req: Request, res: Response, next: NextFunction) => {
  let required: Joi.PresenceMode = 'optional';
  if (req.method === 'POST') {
    required = 'required';
  }
  const errors = Joi.object({
    img_top1: Joi.string().max(255).presence(required),
    img_top2: Joi.string().max(255).presence(required),
    img_top3: Joi.string().max(255).presence(required),
    img_bottom1: Joi.string().max(255).presence(required),
    img_bottom2: Joi.string().max(255).presence(required),
    img_bottom3: Joi.string().max(255).presence(required),
    video: Joi.string().max(255).presence(required),
    id_carousel: Joi.number().optional(),
    id: Joi.number().optional(),
  }).validate(req.body, { abortEarly: false }).error;
  if (errors) {
    next(new ErrorHandler(422, errors.message));
  } else {
    next();
  }
};

const carouselExists = (req: Request, res: Response, next: NextFunction) => {
  const { id_carousel } = req.params;
  getById(Number(id_carousel)).then((carouselExists: ICarousel) => {
    if (!carouselExists) {
      next(new ErrorHandler(404, `This carousel doesn't exist`));
    } else {
      next();
    }
  });
};

//////////// CRUD models of carousel /////////////
const getAllCarousels = (sortBy = ''): Promise<ICarousel[]> => {
  let sql = 'SELECT *, id_carousel as id FROM carousels';
  if (sortBy) {
    sql += ` ORDER BY ${sortBy}`;
  }
  return connection
    .promise()
    .query<ICarousel[]>(sql)
    .then(([results]) => results);
};

const getById = (id_carousel: number): Promise<ICarousel> => {
  return connection
    .promise()
    .query<ICarousel[]>(
      'select *, id_carousel as id from carousels where id_carousel=?',
      [id_carousel]
    )
    .then(([results]) => results[0]);
};

const updateCarousel = (
  id_carousel: number,
  carousel: ICarousel
): Promise<boolean> => {
  let sql = 'UPDATE carousels SET';
  const sqlValues: (string | number)[] = [];
  let oneValue = false;

  if (carousel.img_top1) {
    sql += ' img_top1 = ? ';
    sqlValues.push(carousel.img_top1);
    oneValue = true;
  }
  if (carousel.img_top2) {
    sql += oneValue ? ', img_top2 = ? ' : ' img_top2 = ? ';
    sqlValues.push(carousel.img_top2);
    oneValue = true;
  }
  if (carousel.img_top3) {
    sql += oneValue ? ', img_top3 = ? ' : ' img_top3 = ? ';
    sqlValues.push(carousel.img_top3);
    oneValue = true;
  }
  if (carousel.img_bottom1) {
    sql += oneValue ? ', img_bottom1 = ? ' : ' img_bottom1 = ? ';
    sqlValues.push(carousel.img_bottom1);
    oneValue = true;
  }
  if (carousel.img_bottom2) {
    sql += oneValue ? ', img_bottom2 = ? ' : ' img_bottom2 = ? ';
    sqlValues.push(carousel.img_bottom2);
    oneValue = true;
  }
  if (carousel.img_bottom3) {
    sql += oneValue ? ', img_bottom3 = ? ' : ' img_bottom3 = ? ';
    sqlValues.push(carousel.img_bottom3);
    oneValue = true;
  }
  if (carousel.video) {
    sql += oneValue ? ', video = ? ' : ' video = ? ';
    sqlValues.push(carousel.video);
    oneValue = true;
  }

  sql += ' WHERE id_carousel = ?';
  sqlValues.push(id_carousel);

  return connection
    .promise()
    .query<ResultSetHeader>(sql, sqlValues)
    .then(([results]) => results.affectedRows === 1);
};

export {
  validateCarousel,
  carouselExists,
  getAllCarousels,
  getById,
  updateCarousel,
};
