import Mail from '../../lib/Mail';

class NewDeliveryMail {
  get key() {
    return 'NewDeliveryMail';
  }

  async handle({ data }) {
    const { deliveryman, product, recipient } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: `Nova entrega disponivel - ${product}`,
      template: 'newDelivery',
      context: {
        deliveryman: deliveryman.name,
        product,
        recipient: recipient.name,
      },
    });
  }
}

export default new NewDeliveryMail();
