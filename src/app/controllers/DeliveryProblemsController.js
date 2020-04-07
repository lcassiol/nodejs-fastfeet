import * as Yup from 'yup';
import Delivery from '../models/Delivery';
import DeliveryProblems from '../models/DeliveryProblems';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';

class DeliveryProblemsController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const deliveryProblems = await DeliveryProblems.findAll({
      limit: 5,
      offset: (page - 1) * 5,
      attributes: ['id', 'description'],
      include: [
        {
          model: Delivery,
          as: 'delivery',
          attributes: ['id', 'product'],
        },
      ],
    });

    return res.json(deliveryProblems);
  }

  async show(req, res) {
    const { id } = req.params;
    const deliveryProblems = await DeliveryProblems.findAll({
      where: {
        delivery_id: id,
      },
      attributes: ['id', 'description'],
      include: [
        {
          model: Delivery,
          as: 'delivery',
          attributes: ['product'],
        },
      ],
    });

    return res.json(deliveryProblems);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id: deliveryId } = req.params;

    const delivery = await Delivery.findOne({
      where: {
        id: deliveryId,
      },
    });

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exist' });
    }

    const { id, description } = await DeliveryProblems.create({
      ...req.body,
      delivery_id: deliveryId,
    });

    return res.json({ id, description });
  }

  async delete(req, res) {
    const { id: deliveryProblemId } = req.params;

    const deliveryProblem = await DeliveryProblems.findOne({
      where: {
        id: deliveryProblemId,
      },
    });

    if (!deliveryProblem) {
      return res.status(400).json({ error: 'This problem does not exist' });
    }

    const delivery = await Delivery.findOne({
      where: {
        id: deliveryProblem.delivery_id,
      },
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exist' });
    }

    await delivery.update({
      canceled_at: new Date(),
      status: 'CANCELADA',
    });

    const { product, recipient, deliveryman } = delivery;

    // envia um email para o entregador sobre isso
    await Queue.add(CancellationMail.key, { product, deliveryman, recipient });

    return res.status(204).json({});
  }
}

export default new DeliveryProblemsController();
