// services/userService.js
const User = require('../models/user');

class UserService {
  async findOrCreateUser(phoneNumber) {
    try {
      let user = await User.findOne({ phoneNumber });
      
      if (!user) {
        user = await User.create({
          phoneNumber,
          monthlyBudget: 0,
          categories: []
        });
      }
      
      return user;
    } catch (error) {
      console.error('Erro ao buscar/criar usuário:', error);
      throw error;
    }
  }
  
  async updateUserBudget(phoneNumber, budget) {
    try {
      const user = await User.findOneAndUpdate(
        { phoneNumber },
        { monthlyBudget: budget },
        { new: true }
      );
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      return user;
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      throw error;
    }
  }
  
  async getUserBudget(userId) {
    const user = await User.findById(userId);
    return user ? user.monthlyBudget : 0;
  }
}

module.exports = new UserService();