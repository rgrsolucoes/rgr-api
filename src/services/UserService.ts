import { UserModel } from '../models/User';
import { UserCreateInput, UserUpdateInput } from '../types';
import { AuthService } from './AuthService';

export class UserService {
  
  static async createUser(userData: UserCreateInput) {
    // Check if user already exists
    const existingUser = await UserModel.findByLoginAndCompany(userData.cp050, userData.cp010);
    if (existingUser) {
      throw new Error('User already exists with this login for the company');
    }

    // Hash password
    const hashedPassword = await AuthService.hashPassword(userData.cp064);
    
    const userToCreate = {
      ...userData,
      cp064: hashedPassword
    };

    return await UserModel.create(userToCreate);
  }

  static async updateUser(login: string, companyId: number, userData: UserUpdateInput) {
    // Check if user exists
    const existingUser = await UserModel.findByLoginAndCompany(login, companyId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // If updating login, check for conflicts
    if (userData.cp050 && userData.cp050 !== login) {
      const conflictUser = await UserModel.findByLoginAndCompany(userData.cp050, userData.cp010 || companyId);
      if (conflictUser) {
        throw new Error('Login already exists for this company');
      }
    }

    // Hash password if provided
    if (userData.cp064) {
      userData.cp064 = await AuthService.hashPassword(userData.cp064);
    }

    return await UserModel.update(login, companyId, userData);
  }

  static async deleteUser(login: string, companyId: number) {
    const existingUser = await UserModel.findByLoginAndCompany(login, companyId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    return await UserModel.delete(login, companyId);
  }

  static async getUser(login: string, companyId: number) {
    const user = await UserModel.findByLoginAndCompany(login, companyId);
    if (!user) {
      throw new Error('User not found');
    }

    // Remove password from response
    const { cp064, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async getUsersByCompany(companyId: number, page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      UserModel.findAllByCompany(companyId, limit, offset),
      UserModel.countByCompany(companyId)
    ]);

    // Remove passwords from response
    const usersWithoutPasswords = users.map(user => {
      const { cp064, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return {
      users: usersWithoutPasswords,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }
}
