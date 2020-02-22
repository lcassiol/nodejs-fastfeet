import * as Yup from 'yup';
import User from '../models/User';
import Recipient from '../models/Recipient';
import File from '../models/File';
import Delivery from '../models/Delivery';

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

    // send an email to deliveryman

    const delivery = await Delivery.create(req.body);

    return res.status(201).json(delivery);
  }

  async update(req, res) {
    // A data de início deve ser cadastrada assim que for feita a retirada do produto pelo entregador, e as retiradas só podem ser feitas entre as 08:00 e 18:00h.

    // A data de término da entrega deve ser cadastrada quando o entregador finalizar a entrega:

    return res.json({});
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
