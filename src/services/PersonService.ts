import { PersonModel } from '../models/Person';
import { PersonCreateInput, PersonUpdateInput } from '../types/person';
import { validateCPF, validateCNPJ } from '../utils/validators';

export class PersonService {
  
  static async createPerson(personData: PersonCreateInput) {
    // Validate person type
    if (personData.CP020 !== '1' && personData.CP020 !== '2') {
      throw new Error('Invalid person type. Must be 1 (física) or 2 (jurídica)');
    }

    // Validate CPF for pessoa física
    if (personData.CP020 === '1') {
      if (!personData.CP028) {
        throw new Error('CPF is required for pessoa física');
      }
      
      if (personData.CP030) {
        throw new Error('Cannot set CNPJ for pessoa física');
      }
      
      if (!validateCPF(personData.CP028)) {
        throw new Error('Invalid CPF format');
      }

      const existingPerson = await PersonModel.findByCPF(personData.CP028, personData.CP010);
      if (existingPerson) {
        throw new Error('CPF already registered for this company');
      }
    }

    // Validate CNPJ for pessoa jurídica
    if (personData.CP020 === '2') {
      if (!personData.CP030) {
        throw new Error('CNPJ is required for pessoa jurídica');
      }

      if (personData.CP028) {
        throw new Error('Cannot set CPF for pessoa jurídica');
      }

      if (!validateCNPJ(personData.CP030)) {
        throw new Error('Invalid CNPJ format');
      }

      const existingPerson = await PersonModel.findByCNPJ(personData.CP030, personData.CP010);
      if (existingPerson) {
        throw new Error('CNPJ already registered for this company');
      }
    }

    return await PersonModel.create(personData);
  }

  static async updatePerson(id: number, companyId: number, personData: PersonUpdateInput) {
    const existingPerson = await PersonModel.findById(id, companyId);
    if (!existingPerson) {
      throw new Error('Person not found');
    }

    // Validate person type change
    const newPersonType = personData.CP020 || existingPerson.CP020;

    // Validate CPF if updating
    if (personData.CP028) {
      if (!validateCPF(personData.CP028)) {
        throw new Error('Invalid CPF format');
      }

      if (newPersonType === '2') {
        throw new Error('Cannot set CPF for pessoa jurídica');
      }

      if (personData.CP028 !== existingPerson.CP028) {
        const conflictPerson = await PersonModel.findByCPF(personData.CP028, companyId);
        if (conflictPerson && conflictPerson.CP018 !== id) {
          throw new Error('CPF already registered for another person');
        }
      }
    }

    // Validate CNPJ if updating
    if (personData.CP030) {
      if (!validateCNPJ(personData.CP030)) {
        throw new Error('Invalid CNPJ format');
      }

      if (newPersonType === '1') {
        throw new Error('Cannot set CNPJ for pessoa física');
      }

      if (personData.CP030 !== existingPerson.CP030) {
        const conflictPerson = await PersonModel.findByCNPJ(personData.CP030, companyId);
        if (conflictPerson && conflictPerson.CP018 !== id) {
          throw new Error('CNPJ already registered for another person');
        }
      }
    }

    // Validate person type change consistency
    if (personData.CP020 && personData.CP020 !== existingPerson.CP020) {
      if (personData.CP020 === '1' && !personData.CP028 && !existingPerson.CP028) {
        throw new Error('CPF is required when changing to pessoa física');
      }
      if (personData.CP020 === '2' && !personData.CP030 && !existingPerson.CP030) {
        throw new Error('CNPJ is required when changing to pessoa jurídica');
      }
    }

    return await PersonModel.update(id, companyId, personData);
  }

  static async deletePerson(id: number, companyId: number) {
    const existingPerson = await PersonModel.findById(id, companyId);
    if (!existingPerson) {
      throw new Error('Person not found');
    }

    return await PersonModel.delete(id, companyId);
  }

  static async getPerson(id: number, companyId: number) {
    const person = await PersonModel.findById(id, companyId);
    if (!person) {
      throw new Error('Person not found');
    }

    return person;
  }

  static async activatePerson(id: number, companyId: number) {
    const person = await PersonModel.findById(id, companyId);
    if (!person) {
      throw new Error('Person not found');
    }

    if (person.CP136 === 1) {
      throw new Error('Person is already active');
    }

    return await PersonModel.activate(id, companyId);
  }

  static async deactivatePerson(id: number, companyId: number) {
    const person = await PersonModel.findById(id, companyId);
    if (!person) {
      throw new Error('Person not found');
    }

    if (person.CP136 === 2) {
      throw new Error('Person is already inactive');
    }

    return await PersonModel.deactivate(id, companyId);
  }

  static async getPersonsByCompany(
    companyId: number, 
    page: number = 1, 
    limit: number = 50,
    filters?: {
      search?: string;
      personType?: '1' | '2';
      status?: number;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    }
  ) {
    const offset = (page - 1) * limit;
    
    const [persons, total] = await Promise.all([
      PersonModel.findAllByCompany(companyId, limit, offset, filters),
      PersonModel.countByCompany(companyId, filters?.search, filters?.personType, filters?.status)
    ]);

    return {
      persons,
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
