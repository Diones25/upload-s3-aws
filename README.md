# Upload S3 AWS - Sistema de Upload de Arquivos

Sistema completo de upload de arquivos para AWS S3 com backend NestJS e frontend Next.js.

## 📋 Visão Geral

Este projeto consiste em uma aplicação full-stack para upload, visualização e gerenciamento de arquivos na AWS S3:

- **Backend**: API REST desenvolvida com NestJS
- **Frontend**: Interface web desenvolvida com Next.js 14 e Tailwind CSS

## 🏗️ Arquitetura

```
upload-s3-aws/
├── backend/          # API NestJS
│   ├── src/
│   │   ├── upload/   # Módulo de upload
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
└── frontend/         # Interface Next.js
    ├── src/
    │   ├── app/      # App Router
    │   ├── components/
    │   └── lib/
    └── package.json
```

## 🚀 Funcionalidades

### Backend (NestJS)
- ✅ Upload de arquivos únicos e múltiplos
- ✅ Geração de URLs assinadas com expiração customizável
- ✅ Validação de tipos de arquivo (JPEG, PNG, GIF, PDF, TXT)
- ✅ Limite de tamanho de arquivo (10MB)
- ✅ Exclusão de arquivos
- ✅ Atualização de arquivos
- ✅ Integração completa com AWS S3

### Frontend (Next.js)
- ✅ Interface responsiva e moderna
- ✅ Upload por drag-and-drop
- ✅ Preview de imagens
- ✅ Galeria de arquivos com paginação
- ✅ Barra de progresso de upload
- ✅ Gerenciamento de arquivos (visualizar, baixar, excluir)
- ✅ Integração com API do backend

## 🛠️ Tecnologias Utilizadas

### Backend
- **NestJS** - Framework Node.js
- **AWS SDK v3** - Integração com S3
- **Multer** - Middleware para upload de arquivos
- **TypeScript** - Linguagem de programação

### Frontend
- **Next.js 14** - Framework React com App Router
- **TypeScript** - Linguagem de programação
- **Tailwind CSS** - Framework CSS
- **React Dropzone** - Componente de drag-and-drop
- **Axios** - Cliente HTTP
- **React Icons** - Biblioteca de ícones

## ⚙️ Configuração e Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta AWS com acesso ao S3
- Bucket S3 configurado

### 1. Configuração do Backend

```bash
# Navegar para a pasta do backend
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
```

**Configurar o arquivo `.env`:**
```env
PORT=5000
AWS_ACCESS_KEY_ID=sua-access-key
AWS_SECRET_ACCESS_KEY=sua-secret-key
AWS_REGION=sua-regiao
AWS_S3_BUCKET_NAME=seu-bucket-name
```

```bash
# Iniciar o servidor de desenvolvimento
npm run dev
```

O backend estará disponível em `http://localhost:5000`

### 2. Configuração do Frontend

```bash
# Navegar para a pasta do frontend
cd frontend

# Instalar dependências
npm install
```

**O arquivo `.env.local` já está configurado:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

```bash
# Iniciar o servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em `http://localhost:3001`

## 📡 Endpoints da API

### Upload de Arquivos
- `POST /upload/single` - Upload de arquivo único
- `POST /upload/multiple` - Upload de múltiplos arquivos

### Gerenciamento de Arquivos
- `GET /upload/signed-url/:key` - Obter URL assinada
- `DELETE /upload/:key` - Excluir arquivo
- `PUT /upload/:key` - Atualizar arquivo

### Parâmetros de Upload
- **Tipos aceitos**: JPEG, PNG, GIF, PDF, TXT
- **Tamanho máximo**: 10MB por arquivo
- **Campo do formulário**: `file` ou `files`

## 🔧 Scripts Disponíveis

### Backend
```bash
npm run dev          # Desenvolvimento com watch
npm run build        # Build para produção
npm run start        # Iniciar em produção
npm run test         # Executar testes
npm run lint         # Verificar código
```

### Frontend
```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run start        # Iniciar em produção
npm run lint         # Verificar código
```

## 🔒 Configuração AWS S3

1. **Criar um bucket S3**
2. **Configurar CORS** no bucket:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3001"],
    "ExposeHeaders": ["ETag"]
  }
]
```

3. **Configurar IAM** com permissões:
   - `s3:GetObject`
   - `s3:PutObject`
   - `s3:DeleteObject`
   - `s3:ListBucket`

## 🚀 Deploy

### Backend
- Configurar variáveis de ambiente no servidor
- Executar `npm run build`
- Iniciar com `npm run start:prod`

### Frontend
- Configurar `NEXT_PUBLIC_API_URL` para URL de produção
- Executar `npm run build`
- Deploy no Vercel, Netlify ou servidor próprio

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, abra uma issue no repositório ou entre em contato através do email.

---

**Desenvolvido com ❤️ usando NestJS e Next.js**