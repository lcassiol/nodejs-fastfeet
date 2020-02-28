import Mail from '../../lib/Mail';

class CancellationEmail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { deliveryman, product, recipient } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: `Entrega foi cancelada - ${product}`,
      template: 'cancellation',
      context: {
        deliveryman: deliveryman.name,
        product,
        recipient: recipient.name,
      },
    });
  }
}

export default new CancellationEmail();
