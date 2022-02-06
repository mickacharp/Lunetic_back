import { NextFunction, Request, Response, Router } from 'express';
const newsRouter = Router();
import INews from '../interfaces/INews';
import * as Auth from '../helpers/auth';
import * as New from '../models/new';
import { ErrorHandler } from '../helpers/errors';
import { formatSortString } from '../helpers/functions';

///////////// GET ALL ///////////////

newsRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  const sortBy: string = req.query.sort as string;
  New.getAllNews(formatSortString(sortBy))
    .then((news: INews[]) => {
      res.setHeader(
        'Content-Range',
        `news : 0-${news.length}/${news.length + 1}`
      );
      res.status(200).json(news);
    })
    .catch((err) => next(err));
});

///////////// GET ONE ///////////////

newsRouter.get(
  '/:id_news',
  (req: Request, res: Response, next: NextFunction) => {
    const { id_news } = req.params;
    New.getById(Number(id_news))
      .then((news) => {
        if (news) {
          res.status(200).json(news);
        } else {
          res.status(401).send('No news found');
        }
      })
      .catch((err) => next(err));
  }
);

/////////////////// POST ///////////////////

newsRouter.post(
  '/',
  Auth.getCurrentSession,
  Auth.checkSessionPrivileges,
  New.validateNews,
  (req: Request, res: Response, next: NextFunction) => {
    const news = req.body as INews;
    New.addNews(news)
      .then((newNews) => {
        if (newNews) {
          res.status(201).json({ id: newNews.id_news, ...newNews });
        } else {
          throw new ErrorHandler(500, 'News cannot be created');
        }
      })
      .catch((err) => next(err));
  }
);

/////////////////// UPDATE ///////////////////

newsRouter.put(
  '/:id_news',
  Auth.getCurrentSession,
  Auth.checkSessionPrivileges,
  New.validateNews,
  New.newsExists,
  (req: Request, res: Response, next: NextFunction) => {
    const { id_news } = req.params;
    New.updateNews(Number(id_news), req.body as INews)
      .then((updatedNews) => {
        if (updatedNews) {
          New.getById(Number(id_news)).then(
            (news) => res.status(200).send(news) // react-admin needs this response
          );
        } else {
          throw new ErrorHandler(500, 'News cannot be updated');
        }
      })
      .catch((err) => next(err));
  }
);

newsRouter.delete(
  '/:id_news',
  Auth.getCurrentSession,
  Auth.checkSessionPrivileges,
  New.newsExists,
  (req: Request, res: Response, next: NextFunction) => {
    const { id_news } = req.params;
    New.deleteNews(Number(id_news))
      .then((deletedNews) => {
        if (deletedNews) {
          res.status(200).send(req.record); // react-admin needs this response after a delete
        } else {
          throw new ErrorHandler(409, `News not found`);
        }
      })
      .catch((err) => next(err));
  }
);

export default newsRouter;
