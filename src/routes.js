import express from 'express';

import multer from 'multer';
import authMiddleware from './app/middlewares/auth';

import multerConfig from './config/multer';

import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import DeliveryManController from './app/controllers/DeliveryManController';
import DeliveryController from './app/controllers/DeliveryController';
import PackageController from './app/controllers/PackageController';
import DeliveryProblemsController from './app/controllers/DeliveryProblemsController';

const routes = express.Router();
const upload = multer(multerConfig);

routes.get('/', async (req, res) => {
  return res.json({ working: true });
});

routes.post('/session', SessionController.store);

// Apply authMiddleware
routes.use(authMiddleware);

// users
routes.post('/users', UserController.store);
routes.get('/users', UserController.index);
routes.put('/users/:id', UserController.update);

// recipients
routes.get('/recipients', RecipientController.index);
routes.get('/recipients/:id', RecipientController.show);
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);

// upload de imagem
routes.post('/files', upload.single('file'), FileController.store);

// deliveryman
routes.get('/deliveryman', DeliveryManController.index);
routes.get('/deliveryman/:id', DeliveryManController.show);
routes.post('/deliveryman', DeliveryManController.store);
routes.put('/deliveryman/:id', DeliveryManController.update);
routes.delete('/deliveryman/:id', DeliveryManController.delete);

// deliveries
routes.get('/delivery', DeliveryController.index);
routes.get('/delivery/:id', DeliveryController.show);
routes.post('/delivery', DeliveryController.store);
routes.put('/delivery/:id', DeliveryController.update);
routes.delete('/delivery/:id', DeliveryController.delete);

// deliveryman actions
routes.get('/deliveryman/:id/deliveries', PackageController.show);
routes.put('/deliveryman/:id/delivery/:deliveryId', PackageController.update);

// delivery problems
routes.get('/delivery-problems/', DeliveryProblemsController.index);
routes.get('/delivery/:id/problems', DeliveryProblemsController.show);

routes.delete(
  '/problem/:id/cancel-delivery',
  DeliveryProblemsController.delete
);

// deliveryman create delivery problem
routes.post('/delivery/:id/problems', DeliveryProblemsController.store);

export default routes;
