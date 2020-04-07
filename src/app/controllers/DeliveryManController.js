import * as Yup from 'yup';
import { Op } from 'sequelize';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliveryManController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const { q } = req.query;
    const whereParameter = {};

    if (q) {
      whereParameter.name = {
        [Op.iLike]: `${q}%`,
      };
    }

    const couriers = await Deliveryman.findAll({
      limit: 5,
      offset: (page - 1) * 5,
      where: whereParameter,
      attributes: ['id', 'name', 'email'],
      include: {
        model: File,
        as: 'avatar',
        attributes: ['id', 'url', 'name', 'path'],
      },
    });

    return res.json(couriers);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const deliverymanExist = await Deliveryman.findOne({
      where: { email: req.body.email },
    });

    if (deliverymanExist) {
      return res.status(400).json({ error: 'Deliveryman already exists. ' });
    }

    const deliveryman = await Deliveryman.create(req.body);

    return res.status(201).json(deliveryman);
  }

  async show(req, res) {
    const deliveryman = await Deliveryman.findOne({
      where: { id: req.params.id },
      attributes: ['id', 'name', 'email'],
      include: {
        model: File,
        as: 'avatar',
        attributes: ['id', 'url', 'name'],
      },
    });

    return res.json(deliveryman);
  }

  async delete(req, res) {
    const { id } = req.params;

    const deliveryExists = await Deliveryman.findByPk(id);

    if (!deliveryExists) {
      return res.status(400).json({ error: 'Delivery not exists' });
    }

    await Deliveryman.destroy({ where: { id } });

    return res.status(200).json();
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      avatar_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const deliverymanId = req.params.id;
    const deliveryman = await Deliveryman.findByPk(deliverymanId);
    const { email: newEmail } = req.body;

    if (!deliveryman) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (newEmail && newEmail !== deliveryman.email) {
      const deliverymanExist = await Deliveryman.findOne({
        where: { email: newEmail },
      });

      if (deliverymanExist) {
        return res
          .status(400)
          .json({ error: 'This email is used by other deliveryman. ' });
      }
    }

    await deliveryman.update(req.body);

    const response = await Deliveryman.findOne({
      where: { id: req.params.id },
      attributes: ['id', 'name', 'email'],
      include: {
        model: File,
        as: 'avatar',
        attributes: ['id', 'url', 'name', 'path'],
      },
    });

    return res.json(response);
  }
}

export default new DeliveryManController();
