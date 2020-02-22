import * as Yup from 'yup';
import User from '../models/User';
import File from '../models/File';

class DeliveryManController {
  async index(req, res) {
    const couriers = await User.findAll({
      where: { deliveryman: true },
      attributes: ['id', 'name', 'email'],
      include: {
        model: File,
        as: 'avatar',
        attributes: ['id', 'url', 'name'],
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

    const userExist = await User.findOne({ where: { email: req.body.email } });

    if (userExist) {
      return res.status(400).json({ error: 'User already exists. ' });
    }

    if (!req.body.deliveryman) {
      req.body.deliveryman = true;
    }

    const { id, name, email, deliveryman } = await User.create(req.body);

    return res.status(201).json({ id, name, email, deliveryman });
  }

  async show(req, res) {
    const couriers = await User.findOne({
      where: { id: req.params.id, deliveryman: true },
      attributes: ['id', 'name', 'email'],
      include: {
        model: File,
        as: 'avatar',
        attributes: ['id', 'url', 'name'],
      },
    });

    return res.json(couriers);
  }

  async delete(req, res) {
    const { id } = req.params;

    const deliveryExists = await User.findByPk(id);

    if (!deliveryExists) {
      return res.status(400).json({ error: 'Delivery not exists' });
    }

    await User.destroy({ where: { id } });

    return res.status(200).json();
  }
}

export default new DeliveryManController();
