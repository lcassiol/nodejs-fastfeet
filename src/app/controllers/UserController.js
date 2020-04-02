import * as Yup from 'yup';
import User from '../models/User';
import File from '../models/File';

class UserController {
  async index(req, res) {
    const users = await User.findAll({
      attributes: {
        exclude: ['password_hash', 'createdAt', 'updatedAt', 'avatar_id'],
      },
      include: {
        model: File,
        as: 'avatar',
        attributes: ['id', 'url', 'name'],
      },
    });

    return res.json(users);
  }

  async show(req, res) {
    const user = await User.findByPk(req.params.id);

    if (user) {
      const { id, name, email } = user;

      return res.json({
        id,
        name,
        email,
      });
    }

    return res.status(400).json({ error: 'User not found' });
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

    const { id, name, email } = await User.create(req.body);

    return res.status(201).json({ id, name, email });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      avatar_id: Yup.number(),
      change_password: Yup.boolean(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const user = await User.findByPk(req.params.id);
    const { email: newEmail, oldPassword } = req.body;

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (newEmail && newEmail !== user.email) {
      const userExists = await User.findOne({ where: { email: newEmail } });

      if (userExists) {
        return res
          .status(400)
          .json({ error: 'This email is used by other user. ' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(400).json({ error: 'Password does not match' });
    }

    const { id, name, email, avatar_id } = await user.update(req.body);
    return res.json({ id, name, email, avatar_id });
  }

  async delete(req, res) {
    const { id } = req.params;

    const userExists = await User.findByPk(id);

    if (!userExists) {
      return res.status(400).json({ error: 'User not exists' });
    }

    await User.destroy({ where: { id } });

    return res.status(200).json();
  }
}

export default new UserController();
