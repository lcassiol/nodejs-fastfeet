module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'change_password', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('users', 'change_password');
  },
};
