import { Request, Response, Router } from 'express';
const newsRouter = Router();
import INews from '../interfaces/INews';
import * as New from '../models/new';
import { ErrorHandler } from '../helpers/errors';

newsRouter.get('/', (req: Request, res: Response) => {
  New.getAllNews()
    .then((news: Array<INews>) => {
      res.status(200).json(news);
    })
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'News cannot be found');
    });
});

newsRouter.get('/:id_news', (req: Request, res: Response) => {
  New.getById(Number(req.params.id_news))
    .then((news) => {
      if (news) {
        res.status(200).json(news);
      } else {
        res.status(401).send('No news found');
      }
    })
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'news cannot be found');
    });
});

newsRouter.post('/', New.validateNews, (req: Request, res: Response) => {
  const news = req.body as INews;
  New.addNews(news)
    .then((newNews) => res.status(200).json(newNews))
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(500, 'The new cannot be created');
    });
});

newsRouter.put(
  '/:id_news',
  New.validateNews,
  New.newsExists,
  (req: Request, res: Response) => {
    const { id_news } = req.params;
    console.log(id_news);
    New.updateNews(Number(id_news), req.body as INews)
      .then((updatedNews) => {
        if (updatedNews) {
          res.status(200).send('News updated');
        } else {
          throw new ErrorHandler(500, 'News cannot be updated');
        }
      })
      .catch((err) => {
        console.log(err);
        throw new ErrorHandler(500, 'News cannot be modified');
      });
  }
);

newsRouter.delete('/:id_news', (req: Request, res: Response) => {
  const { id_news } = req.params;
  New.deleteNews(Number(id_news))
    .then((deletedNews) => {
      if (deletedNews) {
        res.status(200).send('News deleted');
      } else {
        res.status(401).send('No news found');
      }
    })
    .catch((err) => {
      console.log(err);
      throw new ErrorHandler(
        500,
        'News cannot be deleted, something wrong happened'
      );
    });
});

export default newsRouter;
