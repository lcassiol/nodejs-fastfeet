import { Op } from 'sequelize';
import Recipient from '../models/Recipient';

class RecipientController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const { q } = req.query;
    const whereParameters = {};

    if (q) {
      whereParameters.name = { [Op.iLike]: `${q}%` };
    }

    const recipients = await Recipient.findAll({
      limit: 5,
      offset: (page - 1) * 5,
      where: whereParameters,
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });

    return res.json(recipients);
  }

  async show(req, res) {
    const recipient = await Recipient.findByPk(req.params.id);

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient doest not exist.' });
    }

    return res.json(recipient);
  }

  async store(req, res) {
    const recipientExist = await Recipient.findOne({
      where: { name: req.body.name },
    });

    if (recipientExist) {
      return res.status(400).json({ error: 'Recipient already exist. ' });
    }

    const recipient = await Recipient.create(req.body);

    return res.json(recipient);
  }

  async update(req, res) {
    let recipient = await Recipient.findByPk(req.params.id);

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient does not exist' });
    }

    recipient = await recipient.update(req.body);

    return res.status(200).json(recipient);
  }
}

export default new RecipientController();
