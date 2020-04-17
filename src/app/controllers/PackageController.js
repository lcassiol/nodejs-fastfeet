import { Op } from 'sequelize';
import * as Yup from 'yup';
import {
  isBefore,
  subMinutes,
  parseISO,
  setSeconds,
  setMinutes,
  setHours,
  startOfDay,
  endOfDay,
  isWithinInterval,
  isValid,
} from 'date-fns';

import Deliveryman from '../models/Deliveryman';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';

class PackageController {
  async show(req, res) {
    const deliverymanId = req.params.id;
    const { finished, q, page = 1 } = req.query;
    const whereParameters = {
      deliveryman_id: deliverymanId,
    };

    if (finished.toLowerCase() === 'true') {
      whereParameters.signature_id = { [Op.ne]: null };
    } else {
      whereParameters.canceled_at = null;
      whereParameters.signature_id = null;
    }

    if (q) {
      whereParameters.product = { [Op.iLike]: `${q}%` };
    }

    const deliverymanExist = await Deliveryman.findOne({
      where: { id: deliverymanId },
    });

    if (!deliverymanExist) {
      return res.status(400).json({ error: 'Deliveryman does not exist' });
    }

    const deliveries = await Delivery.findAll({
      limit: 5,
      offset: (page - 1) * 5,
      attributes: { exclude: ['signature_id', 'updatedAt'] },
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
      ],
      where: whereParameters,
      order: [['createdAt', 'ASC']],
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

    const deliverymanId = parseInt(req.params.id, 10);
    const deliveryId = parseInt(req.params.deliveryId, 10);
    const signatureId = req.body.signature_id;

    const userExist = await Deliveryman.findOne({
      where: { id: deliverymanId },
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

    if (delivery.deliveryman_id !== deliverymanId) {
      return res
        .status(400)
        .json({ error: 'This user are not assign to this delivery' });
    }

    const startDate = parseISO(req.body.start_date);
    const endDate = parseISO(req.body.end_date);

    if (isValid(startDate)) {
      if (isBefore(startDate, subMinutes(new Date(), 2))) {
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

      req.body = { ...req.body, status: 'RETIRADA' };
    }

    if (isValid(endDate) && !signatureId) {
      return res.status(400).json({
        error: 'To finish order you need put a picture of recipient signature',
      });
    }
    if (isValid(endDate) && signatureId) {
      req.body = { ...req.body, status: 'ENTREGUE' };
    }

    const ordersPickupToday = await Delivery.findAll({
      where: {
        start_date: {
          [Op.between]: [startOfDay(new Date()), endOfDay(new Date())],
        },
        deliveryman_id: deliverymanId,
      },
    });

    if (ordersPickupToday.length < 5) {
      await delivery.update(req.body);

      const data = await Delivery.findOne({
        attributes: { exclude: ['signature_id', 'updatedAt'] },
        include: [
          {
            model: Recipient,
            as: 'recipient',
            attributes: { exclude: ['createdAt', 'updatedAt'] },
          },
        ],
        where: {
          id: deliveryId,
        },
      });

      return res.json(data);
    }

    return res
      .status(400)
      .json({ error: 'You exceed your limit of withdrawals per day.' });
  }
}

export default new PackageController();
