-- MODELO dos dados reais das empresas (impressos no contrato).
-- 1. Copie este arquivo para resources/empresas.local.sql (esse nome é ignorado pelo Git e nunca é publicado).
-- 2. Preencha os valores e execute:  mysql -u USUARIO -p modelo_movelaria < resources/empresas.local.sql
-- Campos sem informação podem ficar NULL: o contrato imprime uma linha em branco para preenchimento manual.
SET NAMES utf8mb4;

UPDATE Empresa SET
    Nome = 'Nome Fantasia Ltda',
    CNPJ = NULL,
    Endereco = 'Rua Exemplo, 123',
    Bairro = 'Centro',
    Cidade = 'Cidade - UF',
    CEP = '00000-000',
    Telefone = '(00) 00000-0000',
    Whatsapp = '00 00000-0000',
    Email = 'contato@exemplo.com.br',
    EmailFinanceiro = 'financeiro@exemplo.com.br',
    Responsavel = 'NOME DE QUEM ASSINA'
WHERE Codigo = 'apparato';

UPDATE Empresa SET
    Nome = 'Nome Fantasia Ltda',
    CNPJ = NULL,
    Endereco = NULL,
    Bairro = NULL,
    Cidade = NULL,
    CEP = NULL,
    Telefone = NULL,
    Whatsapp = NULL,
    Email = NULL,
    EmailFinanceiro = NULL,
    Responsavel = NULL
WHERE Codigo = 'signore';
