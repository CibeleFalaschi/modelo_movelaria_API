const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadRoot = path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads'));
const extensoesPermitidas = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf', '.dwg', '.dxf', '.skp', '.doc', '.docx', '.xls', '.xlsx', '.zip']);
const tamanhoMaximo = 15 * 1024 * 1024;

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return cb(Object.assign(new Error('Orçamento inválido'), { status: 400 }));
    const dir = path.join(uploadRoot, String(id));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    // Nome em disco aleatório: o nome original fica só no banco (evita colisão e path traversal).
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: tamanhoMaximo, files: 1 },
  fileFilter(req, file, cb) {
    if (!extensoesPermitidas.has(path.extname(file.originalname).toLowerCase())) {
      return cb(Object.assign(new Error('Tipo de arquivo não permitido'), { status: 400 }));
    }
    cb(null, true);
  }
});

module.exports = { upload, uploadRoot };
