import connection from '../db-config';
import Joi from 'joi';
import { ResultSetHeader } from 'mysql2';
import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../helpers/errors';
import INews from '../interfaces/INews';

const validateNews = (req: Request, res: Response, next: NextFunction) => {
  let required: Joi.PresenceMode = 'optional';
  if (req.method === 'POST') {
    required = 'required';
  }
  const errors = Joi.object({
    title: Joi.string().max(255).allow('', null),
    subtitle: Joi.string().max(255).allow('', null),
    text: Joi.string().allow('', null),
    link_picture: Joi.string().max(255).allow('', null),
  }).validate(req.body, { abortEarly: false }).error;
  if (errors) {
    next(new ErrorHandler(422, errors.message));
  } else {
    next();
  }
};

const getAllNews = (sortBy: string = ''): Promise<INews[]> => {
  let sql: string = 'SELECT *, id_news as id FROM news';
  if (sortBy) {
    sql += ` ORDER BY ${sortBy}`;
  }
  return connection
    .promise()
    .query<INews[]>(sql)
    .then(([results]) => results);
};

const addNews = (news: INews) => {
  return connection
    .promise()
    .query<ResultSetHeader>(
      'INSERT INTO news (title, subtitle, text, link_picture) VALUES (?, ?, ?, ?)',
      [news.title, news.subtitle, news.text, news.link_picture]
    )
    .then(([results]) => {
      const id_news = results.insertId;
      const { title, subtitle, text, link_picture } = news;
      return {
        id_news,
        title,
        subtitle,
        text,
        link_picture,
      };
    });
};

const getById = (id_news: number): Promise<INews> => {
  return connection
    .promise()
    .query<INews[]>('SELECT * FROM news WHERE id_news = ?', [id_news])
    .then(([results]) => results[0]);
};

const newsExists = async (req: Request, res: Response, next: NextFunction) => {
  const { id_news } = req.params;
  const newsExists: INews = await getById(Number(id_news));
  if (!newsExists) {
    next(new ErrorHandler(404, `This news doesn't exist`));
  } else {
    next();
  }
};

const updateNews = async (id_news: number, news: INews): Promise<boolean> => {
  let sql = 'UPDATE news SET';
  const sqlValues: Array<string | number> = [];
  let oneValue = false;

  if (news.title) {
    sql += ' title = ? ';
    sqlValues.push(news.title);
    oneValue = true;
  }
  if (news.subtitle) {
    sql += oneValue ? ', subtitle = ? ' : ' subtitle = ? ';
    sqlValues.push(news.subtitle);
    oneValue = true;
  }
  if (news.text) {
    sql += oneValue ? ', text = ? ' : ' text = ? ';
    sqlValues.push(news.text);
    oneValue = true;
  }
  if (news.link_picture) {
    sql += oneValue ? ', link_picture = ? ' : ' link_picture = ? ';
    sqlValues.push(news.link_picture);
    oneValue = true;
  }

  sql += ' WHERE id_news = ?';
  sqlValues.push(id_news);

  return connection
    .promise()
    .query<ResultSetHeader>(sql, sqlValues)
    .then(([results]) => results.affectedRows === 1);
};

const deleteNews = (id_news: number): Promise<boolean> => {
  return connection
    .promise()
    .query<ResultSetHeader>('DELETE FROM news WHERE id_news = ?', [id_news])
    .then(([results]) => results.affectedRows === 1);
};

export {
  validateNews,
  getAllNews,
  getById,
  addNews,
  newsExists,
  updateNews,
  deleteNews,
};
