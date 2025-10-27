export interface Person {
  CP018: number;              // id (PRIMARY KEY)
  CP010: number;              // id da empresa (multi-tenant)
  CP011: number;              // id da filial
  CP020: '1' | '2';           // tipo pessoa (1-física, 2-jurídica)
  CP051: string;              // nome
  CP028?: string | null;      // CPF
  CP030?: string | null;      // CNPJ
  CP066?: string | null;      // email
  CP031?: string | null;      // telefone
  CP032?: string | null;      // celular
  CP034?: string | null;      // CEP
  CP047?: string | null;      // endereço
  CP590?: string | null;      // número endereço
  CP627?: string | null;      // complemento
  CP048?: string | null;      // cidade
  CP049?: string | null;      // bairro
  CP063?: string | null;      // UF
  CP046?: string | null;      // nome estado
  CP136?: number;             // status (1-ativo, 2-inativo)
  CP001?: Date | null;        // data de cadastro
  CP002?: Date | null;        // data de cadastro 2
  CP008?: Date | null;        // data de nascimento
  CP019?: number;             // id categoria
  CP021?: number;             // id conceito
  CP023?: number | null;      // id atendente
  CP024?: string | null;      // código referência
  CP036?: string | null;      // inscrição municipal
  CP037?: string | null;      // inscrição estadual
  CP052?: string | null;      // contato
  CP053?: string | null;      // nome do pai
  CP054?: string | null;      // nome da mãe
  CP055?: string | null;      // nome cônjuge
  CP056?: string | null;      // profissão
  CP057?: string | null;      // trabalho
  CP065?: string | null;      // site
  CP163?: number;             // sexo (1-masculino, 2-feminino, 3-outros)
  CP165?: string | null;      // link foto
  CP166?: string | null;      // RG
  CP167?: string | null;      // RG emissor
  CP330?: string | null;      // naturalidade
  CP152?: number | null;      // escolaridade
  CP608?: number | null;      // id transportadora
  CP634?: string | null;      // código suframa
  CP058?: string | null;      // observações
  CP268?: number;             // id condição de pagamento
  CP757?: number;             // código simples nacional
  CP767?: string | null;      // CNH
  CP768?: Date | null;        // data expiração CNH
  CP769?: Date | null;        // data expedição RG
  CP771?: number;             // flag bloqueio vendas
  CP168?: string | null;      // nome responsável
  CP028RESP?: string | null;  // CPF responsável financeiro
  CP028PAI?: string | null;   // CPF pai
  CP028MAE?: string | null;   // CPF mãe
  CP031PAI?: string | null;   // fone pai
  CP031MAE?: string | null;   // fone mãe
  CP372?: Date | null;        // data atualização
  CP373?: number | null;      // id usuário responsável
  CP780?: string | null;      // número carteira de trabalho
  CP852?: string | null;      // número título eleitor
  CP066nfe?: string | null;   // email NFe
  CP165_SITE?: string | null; // link foto site
  CP899?: number;             // CBO
  CP266?: number;             // id forma de pagamento
  CP065F?: string | null;     // link Facebook
  CP065I?: string | null;     // link Instagram
  CP909?: number | null;      // id rede
  CP907?: number | null;      // id rota
  CP166CRM?: string | null;   // número CRM médico
}

export interface PersonCreateInput {
  CP010: number;              // id da empresa (obrigatório - multi-tenant)
  CP011: number;              // id da filial (obrigatório)
  CP020: '1' | '2';           // tipo pessoa (obrigatório)
  CP051: string;              // nome (obrigatório)
  CP028?: string;             // CPF
  CP030?: string;             // CNPJ
  CP066?: string;             // email
  CP031?: string;             // telefone
  CP032?: string;             // celular
  CP034?: string;             // CEP
  CP047?: string;             // endereço
  CP590?: string;             // número endereço
  CP627?: string;             // complemento
  CP048?: string;             // cidade
  CP049?: string;             // bairro
  CP063?: string;             // UF
  CP046?: string;             // nome estado
  CP136?: number;             // status
  CP008?: string;             // data nascimento
  CP019?: number;             // id categoria
  CP021?: number;             // id conceito
  CP023?: number;             // id atendente
  CP024?: string;             // código referência
  CP036?: string;             // inscrição municipal
  CP037?: string;             // inscrição estadual
  CP052?: string;             // contato
  CP053?: string;             // nome pai
  CP054?: string;             // nome mãe
  CP055?: string;             // nome cônjuge
  CP056?: string;             // profissão
  CP057?: string;             // trabalho
  CP065?: string;             // site
  CP163?: number;             // sexo
  CP165?: string;             // link foto
  CP166?: string;             // RG
  CP167?: string;             // RG emissor
  CP330?: string;             // naturalidade
  CP152?: number;             // escolaridade
  CP608?: number;             // id transportadora
  CP634?: string;             // código suframa
  CP058?: string;             // observações
  CP268?: number;             // id condição pagamento
  CP757?: number;             // simples nacional
  CP767?: string;             // CNH
  CP768?: string;             // data expiração CNH
  CP769?: string;             // data expedição RG
  CP771?: number;             // flag bloqueio vendas
  CP168?: string;             // nome responsável
  CP028RESP?: string;         // CPF responsável
  CP028PAI?: string;          // CPF pai
  CP028MAE?: string;          // CPF mãe
  CP031PAI?: string;          // fone pai
  CP031MAE?: string;          // fone mãe
  CP373?: number;             // id usuário responsável
  CP780?: string;             // carteira trabalho
  CP852?: string;             // título eleitor
  CP066nfe?: string;          // email NFe
  CP165_SITE?: string;        // link foto site
  CP899?: number;             // CBO
  CP266?: number;             // id forma pagamento
  CP065F?: string;            // Facebook
  CP065I?: string;            // Instagram
  CP909?: number;             // id rede
  CP907?: number;             // id rota
  CP166CRM?: string;          // CRM médico
}

export interface PersonUpdateInput {
  CP011?: number;
  CP020?: '1' | '2';
  CP051?: string;
  CP028?: string;
  CP030?: string;
  CP066?: string;
  CP031?: string;
  CP032?: string;
  CP034?: string;
  CP047?: string;
  CP590?: string;
  CP627?: string;
  CP048?: string;
  CP049?: string;
  CP063?: string;
  CP046?: string;
  CP136?: number;
  CP008?: string;
  CP019?: number;
  CP021?: number;
  CP023?: number;
  CP024?: string;
  CP036?: string;
  CP037?: string;
  CP052?: string;
  CP053?: string;
  CP054?: string;
  CP055?: string;
  CP056?: string;
  CP057?: string;
  CP065?: string;
  CP163?: number;
  CP165?: string;
  CP166?: string;
  CP167?: string;
  CP330?: string;
  CP152?: number;
  CP608?: number;
  CP634?: string;
  CP058?: string;
  CP268?: number;
  CP757?: number;
  CP767?: string;
  CP768?: string;
  CP769?: string;
  CP771?: number;
  CP168?: string;
  CP028RESP?: string;
  CP028PAI?: string;
  CP028MAE?: string;
  CP031PAI?: string;
  CP031MAE?: string;
  CP373?: number;
  CP780?: string;
  CP852?: string;
  CP066nfe?: string;
  CP165_SITE?: string;
  CP899?: number;
  CP266?: number;
  CP065F?: string;
  CP065I?: string;
  CP909?: number;
  CP907?: number;
  CP166CRM?: string;
}
