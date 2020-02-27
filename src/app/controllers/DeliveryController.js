import * as Yup from 'yup';
import User from '../models/User';
import Recipient from '../models/Recipient';
import File from '../models/File';
import Delivery from '../models/Delivery';
import Mail from '../../lib/Mail';

class DeliveryController {
  async index(req, res) {
    const deliveries = await Delivery.findAll({
      attributes: { exclude: ['signature_id', 'createdAt', 'updatedAt'] },
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'url', 'name'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
        {
          model: User,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'url', 'name'],
            },
          ],
        },
      ],
    });

    return res.json(deliveries);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, deliveryman_id, product } = req.body;

    const recipientExist = await Recipient.findOne({
      where: {
        id: recipient_id,
      },
    });

    if (!recipientExist) {
      return res.status(400).json({ error: 'Recipient does not exist' });
    }

    const deliveryman = await User.findOne({
      where: {
        id: deliveryman_id,
        deliveryman: true,
      },
    });

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exist' });
    }

    const delivery = await Delivery.create(req.body);

    // send an email to deliveryman
    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: `Nova entrega disponivel - ${product}`,
      text: `${product} já esta disponível para retirada`,
    });

    return res.status(201).json(delivery);
  }

  async update(req, res) {
    const schema = Yup.object(req.body).shape({
      product: Yup.string(),
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fail' });
    }

    const { deliveryman_id, recipient_id } = req.body;

    const deliverymanExists = await User.findOne({
      where: { id: deliveryman_id },
    });

    if (!deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    const recipientExists = await Recipient.findOne({
      where: { id: recipient_id },
    });

    if (!recipientExists) {
      return res.status(400).json({ error: 'Recipient does not exists' });
    }

    const delivery = await Delivery.findByPk(req.params.id);

    const { id, product } = await delivery.update(req.body);

    return res.json({
      id,
      product,
      recipient_id,
      deliveryman_id,
    });
  }

  async show(req, res) {
    const delivery = await Delivery.findOne({
      where: { id: req.params.id },
      attributes: { exclude: ['signature_id', 'createdAt', 'updatedAt'] },
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'url', 'name'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
        {
          model: User,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'url', 'name'],
            },
          ],
        },
      ],
    });

    return res.json(delivery);
  }

  async delete(req, res) {
    const { id } = req.params;

    const deliveryExists = await Delivery.findByPk(id);

    if (!deliveryExists) {
      return res.status(400).json({ error: 'Delivery not exists' });
    }

    await Delivery.destroy({ where: { id } });

    return res.status(200).json();
  }
}

export default new DeliveryController();
