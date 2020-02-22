module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'deliveryman', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('users', 'deliveryman');
  },
};
