const clienteModel = require('../models/clienteModel');
const contatoModel = require('../models/contatoModel');
const enderecoModel = require('../models/enderecoModel');

function toResponse(row) {
  return {
    id: row.ID,
    idContato: row.IDContato,
    cpfCnpj: row.CPF_CNPJ,
    rg: row.RG,
    dataNascimento: row.DataNascimento,
    profissao: row.Profissao,
    estadoCivil: row.EstadoCivil,
    observacao: row.Observacao,
    codigoCliente: row.CodigoCliente,
    dataCadastro: row.DataCadastro,
    contato: { id: row.IDContato, nome: row.contatoNome, telefone: row.contatoTelefone, email: row.contatoEmail },
    empresa: row.empresaId ? { id: row.empresaId, nome: row.empresaNome, codigo: row.empresaCodigo } : null,
    endereco: row.enderecoId ? { id: row.enderecoId, logradouro: row.Logradouro, numero: row.Numero, complemento: row.Complemento, bairro: row.Bairro, cidade: row.Cidade, estado: row.Estado, cep: row.CEP } : null,
    cidade: row.Cidade || null,
    estado: row.Estado || null,
    orcamentos: Array.from({ length: Number(row.totalOrcamentos) || 0 })
  };
}

async function listClientes() { return (await clienteModel.list()).map(toResponse); }

async function updateCliente(id, data) {
  await clienteModel.update(id, data);
  if (data.contato?.id) await contatoModel.update(data.contato.id, data.contato);
  if (data.endereco?.id) await enderecoModel.update(data.endereco.id, data.endereco);
  else if (data.endereco?.Logradouro && data.contato?.id) {
    await enderecoModel.create({ ...data.endereco, IDContato: data.contato.id, Tipo: 'principal', Principal: true });
  }
}

module.exports = { listClientes, updateCliente };
