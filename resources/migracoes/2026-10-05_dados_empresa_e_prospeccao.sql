-- Migração para bancos criados antes de 05/10/2026 (bancos novos já saem certos do banco_movelaria.sql).
-- Execute uma única vez:  mysql -u USUARIO -p modelo_movelaria < resources/migracoes/2026-10-05_dados_empresa_e_prospeccao.sql
SET NAMES utf8mb4;

-- 1. Dados da empresa impressos no contrato.
ALTER TABLE Empresa
    ADD COLUMN Endereco VARCHAR(255),
    ADD COLUMN Bairro VARCHAR(100),
    ADD COLUMN Cidade VARCHAR(100),
    ADD COLUMN CEP VARCHAR(10),
    ADD COLUMN Telefone VARCHAR(20),
    ADD COLUMN Whatsapp VARCHAR(20),
    ADD COLUMN Email VARCHAR(255),
    ADD COLUMN EmailFinanceiro VARCHAR(255),
    ADD COLUMN Responsavel VARCHAR(255) COMMENT 'Quem assina o contrato pela empresa';

-- 2. Prospecção passa a pertencer a uma empresa e a apontar para o orçamento gerado.
ALTER TABLE Prospeccao
    ADD COLUMN IDEmpresa INT NULL AFTER IDFuncionario,
    ADD COLUMN IDOrcamento INT NULL UNIQUE COMMENT 'Orçamento gerado a partir desta prospecção' AFTER IDContato;

-- Prospecções antigas não tinham empresa: ficam com a Apparato (ajuste manualmente se necessário).
UPDATE Prospeccao SET IDEmpresa = (SELECT ID FROM Empresa WHERE Codigo = 'apparato') WHERE IDEmpresa IS NULL;

ALTER TABLE Prospeccao
    MODIFY IDEmpresa INT NOT NULL,
    ADD FOREIGN KEY (IDEmpresa) REFERENCES Empresa(ID),
    ADD FOREIGN KEY (IDOrcamento) REFERENCES Orcamento(ID);
