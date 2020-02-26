import { Op } from 'sequelize';
import * as Yup from 'yup';
import {
  isBefore,
  parseISO,
  setSeconds,
  setMinutes,
  setHours,
  startOfDay,
  endOfDay,
  isWithinInterval,
  isValid,
} from 'date-fns';
import User from '../models/User';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';

class PackageController {
  async show(req, res) {
    const userId = req.params.id;
    const { finished } = req.query;
    const whereParameters = {
      deliveryman_id: userId,
    };

    if (finished.toLowerCase() === 'true') {
      whereParameters.signature_id = { [Op.ne]: null };
    } else {
      whereParameters.canceled_at = null;
      whereParameters.signature_id = null;
    }

    const userExist = await User.findOne({
      where: { id: userId, deliveryman: true },
    });

    if (!userExist) {
      return res.status(400).json({ error: 'User does not exist' });
    }

    const deliveries = await Delivery.findAll({
      attributes: { exclude: ['signature_id', 'createdAt', 'updatedAt'] },
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
      ],
      where: whereParameters,
    });

    return res.json(deliveries);
  }

  async update(req, res) {
    const schema = Yup.object(req.body).shape({
      start_date: Yup.date(),
      end_date: Yup.date(),
      signature_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fail' });
    }

    const userId = parseInt(req.params.id, 10);
    const deliveryId = parseInt(req.params.deliveryId, 10);
    const signatureId = req.body.signature_id;

    const userExist = await User.findOne({
      where: { id: userId, deliveryman: true },
    });

    if (!userExist) {
      return res.status(400).json({ error: 'Deliveryman does not exist' });
    }

    const delivery = await Delivery.findOne({
      where: { id: deliveryId },
    });

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exist' });
    }

    if (delivery.deliveryman_id !== userId) {
      return res
        .status(400)
        .json({ error: 'This user are not assign to this delivery' });
    }

    const startDate = parseISO(req.body.start_date);
    const endDate = parseISO(req.body.end_date);

    if (isValid(startDate)) {
      if (isBefore(startDate, new Date())) {
        return res.status(400).json({ error: 'Past dates are not allowed' });
      }

      if (isBefore(endDate, startDate)) {
        return res
          .status(400)
          .json({ error: 'End date must be after start date' });
      }

      // verify if order was pickup between 08-18h
      const startInterval = setSeconds(
        setMinutes(setHours(new Date(), 8), 0),
        0
      );
      const endInterval = setSeconds(
        setMinutes(setHours(new Date(), 18), 0),
        0
      );

      if (
        !isWithinInterval(startDate, { start: startInterval, end: endInterval })
      ) {
        return res.status(400).json({
          error: 'Orders pickup are allowed between 08:00h until 18:00h',
        });
      }
    }

    if (isValid(endDate) && !signatureId) {
      return res.status(400).json({
        error: 'To finish order you need put a picture of recipient signature',
      });
    }

    const ordersPickupToday = await Delivery.findAll({
      where: {
        start_date: {
          [Op.between]: [startOfDay(new Date()), endOfDay(new Date())],
        },
        deliveryman_id: userId,
      },
    });

    if (ordersPickupToday.length < 5) {
      const data = await delivery.update(req.body, {
        attributes: [
          'id',
          'product',
          'recipient_id',
          'canceled_at',
          'start_date',
          'end_date',
          'signature_id',
        ],
      });

      return res.json(data);
    }

    return res
      .status(400)
      .json({ error: 'You exceed your limit of withdrawals per day.' });
  }
}

export default new PackageController();
