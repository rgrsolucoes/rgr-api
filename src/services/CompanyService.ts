import { CompanyModel, CreateCompanyData, UpdateCompanyData } from '../models/Company';

export class CompanyService {
  
  static async createCompany(data: CreateCompanyData) {
    if (data.cp040) {
      const existing = await CompanyModel.findByCnpj(data.cp040);
      if (existing) {
        throw new Error('Company with this CNPJ already exists');
      }
    }

    const companyId = await CompanyModel.create(data);
    return CompanyModel.findById(companyId);
  }

  static async getCompanyById(id: number) {
    const company = await CompanyModel.findById(id);
    if (!company) {
      throw new Error('Company not found');
    }
    return company;
  }

  static async getAllCompanies(
    page = 1, 
    limit = 50, 
    filters?: {
      activeOnly?: boolean;
      search?: string;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    }
  ) {
    return CompanyModel.findAll(page, limit, filters);
  }

  static async updateCompany(id: number, data: UpdateCompanyData) {
    const company = await CompanyModel.findById(id);
    if (!company) {
      throw new Error('Company not found');
    }

    if (data.cp040 && data.cp040 !== company.cp040) {
      const existing = await CompanyModel.findByCnpj(data.cp040);
      if (existing && existing.cp010 !== id) {
        throw new Error('Company with this CNPJ already exists');
      }
    }

    const updated = await CompanyModel.update(id, data);
    if (!updated) {
      throw new Error('No changes made to company');
    }

    return CompanyModel.findById(id);
  }

  static async deleteCompany(id: number) {
    const company = await CompanyModel.findById(id);
    if (!company) {
      throw new Error('Company not found');
    }

    return CompanyModel.delete(id);
  }

  static async deactivateCompany(id: number) {
    const company = await CompanyModel.findById(id);
    if (!company) {
      throw new Error('Company not found');
    }

    return CompanyModel.deactivate(id);
  }

  static async activateCompany(id: number) {
    const company = await CompanyModel.findById(id);
    if (!company) {
      throw new Error('Company not found');
    }

    return CompanyModel.activate(id);
  }
}
