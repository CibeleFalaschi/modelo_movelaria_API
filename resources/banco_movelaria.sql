-- Active: 1775003047502@@127.0.0.1@3306@modelo_movelaria
CREATE DATABASE IF NOT EXISTS MODELO_MOVELARIA;
USE MODELO_MOVELARIA;

/*
Tabela de contatos: Armazena pessoas que ainda não são clientes, só é um cliente quando fecha um orçamenti
*/

CREATE TABLE Contato (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    origem VARCHAR(255) NOT NULL COMMENT 'Indica como o contato teve conhecimento da movelaria, como "site", "indicação", "instagran", etc.'
);

CREATE TABLE StatusOrcamento (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL
);

--inserção dos  status padrão (StatusOrcamento)--
INSERT INTO StatusOrcamento (descricao) VALUES 
('Em aberto'),
('Em elaboração'),
('Fechado'),
('Perdido'),
('Entregue');

CREATE TABLE IF NOT EXISTS StatusVisita (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(50) NOT NULL,
    observacao TEXT COMMENT 'Campo para observações adicionais sobre o status da visita'
);

--inserção dos  status padrão (StatusVisita)--
INSERT INTO StatusVisita (descricao) VALUES 
('Pendente'),
('Agendada'),
('Realizada'),
('Cancelada');

CREATE TABLE StatusProjeto (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL
);

--inserção dos  status padrão (StatusProjeto)--
INSERT INTO StatusProjeto (descricao) VALUES 
('Em planejamento'),
('Em execução'),
('Concluído'),
('Cancelado');

CREATE TABLE Funcionario (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cargo VARCHAR(50),
    login VARCHAR(50) NOT NULL UNIQUE,
    senhaHash VARCHAR(255),
    Ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS Orcamento (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    IDContato INT NOT NULL,
    IDStatusOrcamento INT NOT NULL,
    IDFuncionario INT NOT NULL,
    NumeroOrcamento VARCHAR(50) NOT NULL UNIQUE,
    DataSolicitacao DATE NOT NULL,
    NecessitaProjeto BOOLEAN NOT NULL DEFAULT FALSE,
    NecessitaVisita BOOLEAN NOT NULL DEFAULT FALSE,
    Observacao VARCHAR(255) COMMENT 'Campo para observações adicionais sobre o orçamento',
    Valor DECIMAL(10,2) NOT NULL,
    DataEntregaOrcamento DATE,
    DataFechamento DATE,

    FOREIGN KEY (IDContato) REFERENCES Contato(ID),
    FOREIGN KEY (IDStatusOrcamento) REFERENCES StatusOrcamento(ID),
    FOREIGN KEY (IDFuncionario) REFERENCES Funcionario(ID)
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
    Valor DECIMAL(10,2) NOT NULL,

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

CREATE TABLE Empresa (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(100) NOT NULL COMMENT 'Nome da empresa para qual está faznedo orçamento',
    CNPJ VARCHAR(20)
);

ALTER TABLE Orcamento
ADD CONSTRAINT FK_Orcamento_Empresa 
FOREIGN KEY (IDEmpresa) REFERENCES Empresa(ID);

CREATE TABLE Cliente (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    IDContato INT NOT NULL UNIQUE,
    CPF_CNPJ VARCHAR(20),
    DataNascimento DATE,
    Profissao VARCHAR(100),
    EstadoCivil VARCHAR(50),
    Endereco VARCHAR(255),
    Cidade VARCHAR(100),
    Estado VARCHAR(50),
    Observacao VARCHAR(255),

    FOREIGN KEY (IDContato) REFERENCES Contato(ID)
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

ALTER TABLE Cliente
ADD CodigoCliente INT,
ADD IDEmpresa INT;

ALTER TABLE Cliente
ADD CONSTRAINT FK_Cliente_Empresa
FOREIGN KEY (IDEmpresa) REFERENCES Empresa(ID);

ALTER TABLE Orcamento
ADD NumeroSequencial INT,
ADD Mes INT,
ADD Ano INT;

ALTER TABLE Cliente
MODIFY CodigoCliente INT UNIQUE;

ALTER TABLE Orcamento
ADD CONSTRAINT UK_Orcamento_NumeroEmpresa
UNIQUE (NumeroSequencial, IDEmpresa);

ALTER TABLE Cliente
ADD DataCadastro DATE;

CREATE TABLE Prospeccao (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    IDFuncionario INT NOT NULL,
    NomeProspecto VARCHAR(255),
    Telefone VARCHAR(20),
    Origem VARCHAR(100),

    IDContato INT NULL,

    Status VARCHAR(50), -- Em andamento, Convertido, Perdido
    DataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (IDFuncionario) REFERENCES Funcionario(ID),
    FOREIGN KEY (IDContato) REFERENCES Contato(ID)
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

-- IDEmpresa já existe, só adiciona a FK e o UNIQUE
ALTER TABLE Orcamento
ADD CONSTRAINT FK_Orcamento_Empresa
    FOREIGN KEY (IDEmpresa) REFERENCES Empresa(ID),
ADD CONSTRAINT UK_Orcamento_NumeroEmpresa
    UNIQUE (NumeroSequencial, IDEmpresa);

ALTER TABLE Cliente ADD RG VARCHAR(20) AFTER CPF_CNPJ;

