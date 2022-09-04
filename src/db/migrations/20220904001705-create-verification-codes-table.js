'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('verification_codes', {
      email: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      expiration: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('verification_codes');
  },
};
