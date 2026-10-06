-- FONTE DA VERDADE: modelo_movelaria_API/resources/banco_movelaria.sql
-- Esta cópia deve ficar idêntica à da API. Altere primeiro na API e copie para cá.
-- Active: 1775003047502@@127.0.0.1@3306@modelo_movelaria
-- Garante leitura do arquivo como UTF-8 (o cliente mysql do Windows usa cp850 por padrão e corrompe acentos).
SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS modelo_movelaria
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE modelo_movelaria;

/*
Tabela de contatos: Armazena pessoas que ainda não são clientes, só é um cliente quando fecha um orçamento
*/

CREATE TABLE Contato (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    origem VARCHAR(255) NOT NULL COMMENT 'Indica como o contato teve conhecimento da movelaria, como "site", "indicação", "instagran", etc.'
);

-- Endereços pertencem ao contato e podem existir antes da conversão em cliente.
CREATE TABLE Endereco (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    IDContato INT NOT NULL,
    Logradouro VARCHAR(255) NOT NULL,
    Numero VARCHAR(20),
    Complemento VARCHAR(100),
    Bairro VARCHAR(100),
    Cidade VARCHAR(100) NOT NULL,
    Estado CHAR(2) NOT NULL,
    CEP VARCHAR(9),
    Tipo VARCHAR(30) NOT NULL DEFAULT 'principal',
    Principal BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (IDContato) REFERENCES Contato(ID),
    INDEX IX_Endereco_Contato (IDContato)
);

CREATE TABLE StatusOrcamento (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(30) NULL UNIQUE,
    descricao VARCHAR(255) NOT NULL UNIQUE
);

-- Status padrão (StatusOrcamento)
INSERT INTO StatusOrcamento (descricao) VALUES 
('Em aberto'),
('Em elaboração'),
('Fechado'),
('Perdido'),
('Entregue');

CREATE TABLE IF NOT EXISTS StatusVisita (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(30) NULL UNIQUE,
    descricao VARCHAR(50) NOT NULL UNIQUE,
    observacao TEXT COMMENT 'Campo para observações adicionais sobre o status da visita'
);

-- Status padrão (StatusVisita)
INSERT INTO StatusVisita (descricao) VALUES 
('Pendente'),
('Agendada'),
('Realizada'),
('Cancelada');

CREATE TABLE StatusProjeto (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(30) NULL UNIQUE,
    descricao VARCHAR(255) NOT NULL UNIQUE
);

-- Status padrão (StatusProjeto)
INSERT INTO StatusProjeto (descricao) VALUES 
('Em planejamento'),
('Em execução'),
('Concluído'),
('Cancelado');

UPDATE StatusOrcamento SET codigo = CASE ID
    WHEN 1 THEN 'aberto' WHEN 2 THEN 'elaboracao' WHEN 3 THEN 'fechado'
    WHEN 4 THEN 'perdido' WHEN 5 THEN 'entregue' END;
UPDATE StatusVisita SET codigo = CASE ID
    WHEN 1 THEN 'pendente' WHEN 2 THEN 'agendada' WHEN 3 THEN 'realizada'
    WHEN 4 THEN 'cancelada' END;
UPDATE StatusProjeto SET codigo = CASE ID
    WHEN 1 THEN 'planejamento' WHEN 2 THEN 'execucao' WHEN 3 THEN 'concluido'
    WHEN 4 THEN 'cancelado' END;
ALTER TABLE StatusOrcamento MODIFY codigo VARCHAR(30) NOT NULL;
ALTER TABLE StatusVisita MODIFY codigo VARCHAR(30) NOT NULL;
ALTER TABLE StatusProjeto MODIFY codigo VARCHAR(30) NOT NULL;

CREATE TABLE Funcionario (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cargo VARCHAR(50),
    login VARCHAR(50) NOT NULL UNIQUE,
    senhaHash VARCHAR(255),
    Perfil VARCHAR(20) NOT NULL DEFAULT 'funcionario' CHECK (Perfil IN ('admin', 'funcionario')),
    Ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE Empresa (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Codigo VARCHAR(50) NOT NULL UNIQUE,
    Nome VARCHAR(100) NOT NULL COMMENT 'Nome da empresa para qual está fazendo orçamento',
    CNPJ VARCHAR(20) UNIQUE,
    -- Dados impressos no contrato. Os valores reais ficam fora do Git (resources/empresas.local.sql).
    Endereco VARCHAR(255),
    Bairro VARCHAR(100),
    Cidade VARCHAR(100),
    CEP VARCHAR(10),
    Telefone VARCHAR(20),
    Whatsapp VARCHAR(20),
    Email VARCHAR(255),
    EmailFinanceiro VARCHAR(255),
    Responsavel VARCHAR(255) COMMENT 'Quem assina o contrato pela empresa'
);

CREATE TABLE Orcamento (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    IDContato INT NOT NULL,
    IDStatusOrcamento INT NOT NULL,
    IDFuncionario INT NOT NULL,
    IDEmpresa INT NOT NULL,
    NumeroOrcamento VARCHAR(50) NOT NULL UNIQUE,
    DataSolicitacao DATE NOT NULL,
    NecessitaProjeto BOOLEAN NOT NULL DEFAULT FALSE,
    NecessitaVisita BOOLEAN NOT NULL DEFAULT FALSE,
    Observacao TEXT COMMENT 'Campo para observações adicionais sobre o orçamento',
    Valor DECIMAL(12,2) NOT NULL CHECK (Valor >= 0),
    DataEntregaOrcamento DATE,
    DataFechamento DATE,
    NumeroSequencial INT NOT NULL,
    Mes TINYINT UNSIGNED NOT NULL CHECK (Mes BETWEEN 1 AND 12),
    Ano SMALLINT UNSIGNED NOT NULL,

    FOREIGN KEY (IDContato) REFERENCES Contato(ID),
    FOREIGN KEY (IDStatusOrcamento) REFERENCES StatusOrcamento(ID),
    FOREIGN KEY (IDFuncionario) REFERENCES Funcionario(ID),
    FOREIGN KEY (IDEmpresa) REFERENCES Empresa(ID),
    UNIQUE KEY UK_Orcamento_NumeroEmpresaAno (NumeroSequencial, IDEmpresa, Ano),
    INDEX IX_Orcamento_StatusData (IDStatusOrcamento, DataSolicitacao)
);

CREATE TABLE Visita (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    IDOrcamento INT NOT NULL,
    IDStatus INT NOT NULL,
    DataAgendada DATE,
    DataRealizada DATE,
    Observacao VARCHAR(255) COMMENT 'Campo para observações adicionais sobre a visita',

    FOREIGN KEY (IDOrcamento) REFERENCES Orcamento(ID),
    FOREIGN KEY (IDStatus) REFERENCES StatusVisita(ID)
);

CREATE TABLE Projeto (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    IDOrcamento INT NOT NULL,
    IDStatus INT NOT NULL,
    NomeProjeto VARCHAR(100),
    DataInicio DATE,
    DataConclusao DATE,
    Observacao VARCHAR(255),

    FOREIGN KEY (IDOrcamento) REFERENCES Orcamento(ID),
    FOREIGN KEY (IDStatus) REFERENCES StatusProjeto(ID)
);

CREATE TABLE IF NOT EXISTS Ambiente (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    IDOrcamento INT NOT NULL,
    Nome VARCHAR(100) NOT NULL,
    Valor DECIMAL(12,2) NOT NULL CHECK (Valor >= 0),
    Observacao TEXT,

    FOREIGN KEY (IDOrcamento) REFERENCES Orcamento(ID)
);

CREATE TABLE IF NOT EXISTS HistoricoOrcamento (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    IDOrcamento INT NOT NULL,
    IDFuncionario INT,
    DataRegistro DATETIME DEFAULT CURRENT_TIMESTAMP,
    Observacao VARCHAR(255) NOT NULL,
    ProximoContato DATE,

    FOREIGN KEY (IDOrcamento) REFERENCES Orcamento(ID),
    FOREIGN KEY (IDFuncionario) REFERENCES Funcionario(ID)
);

CREATE TABLE Cliente (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    IDContato INT NOT NULL UNIQUE,
    CPF_CNPJ VARCHAR(20) UNIQUE,
    DataNascimento DATE,
    Profissao VARCHAR(100),
    EstadoCivil VARCHAR(50),
    Observacao TEXT,
    CodigoCliente INT UNIQUE,
    IDEmpresa INT,
    DataCadastro DATE NOT NULL,
    RG VARCHAR(20),

    FOREIGN KEY (IDContato) REFERENCES Contato(ID),
    FOREIGN KEY (IDEmpresa) REFERENCES Empresa(ID)
);

CREATE TABLE Arquivo (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    IDOrcamento INT NOT NULL,
    NomeArquivo VARCHAR(255) NOT NULL,
    Caminho VARCHAR(500) NOT NULL,
    Tipo VARCHAR(50) NOT NULL COMMENT 'briefing_inspiracao, projeto_tecnico',
    DataUpload DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (IDOrcamento) REFERENCES Orcamento(ID)
);

/*
Prospecção: busca ativa do vendedor por novos clientes. Só vira orçamento quando a pessoa aceita e envia
as informações para cotação (o briefing é gerado a partir da prospecção e ela passa a "Convertido").
*/
CREATE TABLE Prospeccao (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    IDFuncionario INT NOT NULL,
    IDEmpresa INT NOT NULL,
    NomeProspecto VARCHAR(255),
    Telefone VARCHAR(20),
    Origem VARCHAR(100),

    IDContato INT NULL,
    IDOrcamento INT NULL UNIQUE COMMENT 'Orçamento gerado a partir desta prospecção',

    Status VARCHAR(50) NOT NULL DEFAULT 'Em andamento'
        CHECK (Status IN ('Em andamento', 'Convertido', 'Perdido')),
    DataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (IDFuncionario) REFERENCES Funcionario(ID),
    FOREIGN KEY (IDEmpresa) REFERENCES Empresa(ID),
    FOREIGN KEY (IDContato) REFERENCES Contato(ID),
    FOREIGN KEY (IDOrcamento) REFERENCES Orcamento(ID)
);

CREATE TABLE HistoricoProspeccao (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    IDProspeccao INT NOT NULL,
    DataAcao DATETIME DEFAULT CURRENT_TIMESTAMP,
    TipoAcao VARCHAR(50), -- ligação, whatsapp, visita
    Observacao VARCHAR(255),
    ProximoContato DATE,

    FOREIGN KEY (IDProspeccao) REFERENCES Prospeccao(ID)
);

-- Dados iniciais: empresas atendidas pelo sistema (o código é usado nos filtros e na impressão).
INSERT INTO Empresa (Codigo, Nome) VALUES
('apparato', 'Apparato Móveis Sob Medida'),
('signore', 'Signore Mobili');

-- Fim do schema.
