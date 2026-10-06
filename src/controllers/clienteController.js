const clienteService = require('../services/clienteService');

async function list(req, res, next) {
  try { res.json(await clienteService.listClientes()); } catch (error) { next(error); }
}

// Texto vazio vira NULL (CPF_CNPJ é UNIQUE: '' duplicaria no segundo cliente sem documento).
function vazioParaNulo(valor) {
  if (valor === undefined) return undefined;
  const texto = valor === null ? '' : String(valor).trim();
  return texto === '' ? null : texto;
}

async function update(req, res, next) {
  try {
    const body = req.body;
    let endereco;
    if (vazioParaNulo(body.endereco)) {
      const cidade = vazioParaNulo(body.cidade);
      const estado = (vazioParaNulo(body.estado) || '').toUpperCase();
      if (!cidade || !/^[A-Z]{2}$/.test(estado)) {
        return res.status(400).json({ error: 'Informe a cidade e a UF (2 letras) do endereço' });
      }
      endereco = {
        id: body.idEndereco,
        Logradouro: vazioParaNulo(body.endereco),
        Cidade: cidade,
        Estado: estado,
        CEP: vazioParaNulo(body.cep),
        Principal: true
      };
    }
    const data = {
      CPF_CNPJ: vazioParaNulo(body.cpfCnpj),
      RG: vazioParaNulo(body.rg),
      DataNascimento: vazioParaNulo(body.dataNascimento),
      Profissao: vazioParaNulo(body.profissao),
      EstadoCivil: vazioParaNulo(body.estadoCivil),
      Observacao: vazioParaNulo(body.observacao),
      IDEmpresa: body.idEmpresa,
      contato: body.idContato ? { id: body.idContato, nome: vazioParaNulo(body.nome), telefone: vazioParaNulo(body.telefone) } : undefined,
      endereco
    };
    await clienteService.updateCliente(Number(req.params.id), data);
    res.status(204).end();
  } catch (error) { next(error); }
}

module.exports = { list, update };
