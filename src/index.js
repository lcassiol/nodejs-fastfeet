import express from 'express';
import 'express-async-errors';
import cors from 'cors';

import path from 'path';
import Youch from 'youch';
import routes from './routes';

import './database';

class App {
  constructor() {
    this.express = express();

    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  middlewares() {
    this.express.use(express.json());
    this.express.use(cors());
    this.express.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.express.use(routes);
  }

  exceptionHandler() {
    this.express.use(async (err, req, res, next) => {
      const errors = await new Youch(err, req).toJSON();

      console.log(err);
      return res.status(500).json(errors);
    });
  }
}

export default new App().express;
