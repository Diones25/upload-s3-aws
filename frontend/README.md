# Frontend - Upload S3 AWS

Interface de usuário para upload de múltiplos arquivos para o Amazon S3 através da API NestJS.

## Funcionalidades

- Upload de múltiplos arquivos
- Visualização de arquivos enviados
- Exclusão de arquivos
- Visualização de imagens em modal
- Interface responsiva e moderna com Tailwind CSS

## Tecnologias Utilizadas

- Next.js 14
- TypeScript
- Tailwind CSS
- React Dropzone para upload de arquivos
- Axios para comunicação com a API
- React Icons

## Configuração

1. Instale as dependências:

```bash
npm install
```

2. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

3. Acesse a aplicação em [http://localhost:3001](http://localhost:3001)

## Integração com o Backend

O frontend se comunica com o backend NestJS através de requisições HTTP. Certifique-se de que o backend esteja rodando na porta 3000 antes de iniciar o frontend.

A configuração de proxy no `next.config.js` redireciona todas as requisições para `/api/*` para o servidor backend.