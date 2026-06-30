<p align="center">
  <img src="./frontend/src/assets/doc/awss3_nestjs.jpg" alt="TMDB" width="536" height="280" />
</p>

# upload-s3-aws

**Full-stack** application for uploading, managing, and viewing files on **Amazon S3**. Composed of a **NestJS** REST API and a **Next.js 14** web interface with drag-and-drop support, signed URLs, and file validation.

---

## Technologies

| Layer | Technology | Version |
|--------|-----------|--------|
| Backend | [NestJS](https://nestjs.com) | ^11.0 |
| Backend | [AWS SDK v3](https://aws.amazon.com/sdk-for-javascript/) (client-s3) | ^3.901 |
| Backend | [Multer](https://github.com/expressjs/multer) | ^2.0 |
| Backend | [TypeScript](https://www.typescriptlang.org) | ^5.7 |
| Frontend | [Next.js](https://nextjs.org) (App Router) | ^14.0 |
| Frontend | [React](https://react.dev) | ^18.2 |
| Frontend | [Tailwind CSS](https://tailwindcss.com) | ^3.3 |
| Frontend | [Axios](https://axios-http.com) | ^1.6 |
| Frontend | [react-dropzone](https://react-dropzone.js.org) | ^14.2 |
| Frontend | [TypeScript](https://www.typescriptlang.org) | ^5.3 |

---

## Architecture

The project follows a **monorepo** pattern with two independent packages:

- **Backend** — **Modular** architecture (NestJS): modules group *controllers* (HTTP), *services* (business rules / S3), and *decorators* (validation). Uses dependency injection and declarative programming with decorators.
- **Frontend** — **Single-page application** with Next.js App Router: pages consume the API via isolated *client components* in `components/` and a centralized HTTP client in `lib/`.

```
Web Client (Next.js 14)
       │
       │  HTTP (axios)
       ▼
Next.js Proxy (/api/* → localhost:5000)
       │
       ▼
 REST API (NestJS)
       │
       ▼
 Amazon S3 (AWS SDK v3)
```

---

## How to Run

### Prerequisites

- Node.js 18+
- npm
- AWS account with S3 bucket created and IAM credentials (`s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`, `s3:ListBucket`)

### 1. Backend

```bash
cd backend
cp .env.example .env     # edit with your AWS credentials
npm install
npm run dev              # http://localhost:5000
```

**Environment variables (`.env`):**

| Variable | Description | Required |
|----------|-----------|-------------|
| `PORT` | Server port (default: 5000) | No |
| `AWS_ACCESS_KEY_ID` | AWS access key | Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | Yes |
| `AWS_REGION` | Bucket region (e.g. `us-east-1`) | Yes |
| `AWS_S3_BUCKET_NAME` | S3 bucket name | Yes |

### 2. Frontend

```bash
cd frontend
npm install
npm run dev              # http://localhost:3001
```

**Environment variable (`.env.local`):**

| Variable | Description | Default |
|----------|-----------|--------|
| `NEXT_PUBLIC_API_URL` | API base URL | `http://localhost:5000` |

> Next.js proxies `/api/*` requests to `http://localhost:5000/*` (configured in `next.config.js`).

---

## Folder Structure

```
upload-s3-aws/
├── backend/                          # NestJS API
│   ├── src/
│   │   ├── main.ts                   # Entry point
│   │   ├── app.module.ts             # Root module (ConfigModule, UploadModule)
│   │   └── upload/                   # Upload module (controllers, services, decorators, interfaces)
│   ├── test/                         # E2E test configuration
│   ├── dist/                         # Production build (generated)
│   ├── .env.example                  # Environment variable template
│   └── nest-cli.json
├── frontend/                         # Next.js interface
│   ├── src/
│   │   ├── app/                      # App Router (layout, pages, global styles)
│   │   ├── components/               # Reusable components (FileUploader, ImageGallery)
│   │   └── lib/                      # Utilities (api.ts, types.ts)
│   ├── next.config.js                # /api/* proxy to backend
│   └── tailwind.config.js
└── .gitignore
```

---

## API

| Method | Route | Description |
|--------|------|-----------|
| `POST` | `/upload/single` | Upload single file (field: `file`) |
| `POST` | `/upload/multiple` | Upload multiple files (field: `files`, max 10) |
| `GET` | `/upload/signed-url/:key?expiresIn=3600` | Signed URL for download |
| `DELETE` | `/upload/:key` | Delete file |
| `PUT` | `/upload/:key` | Replace file |

**Restrictions:** JPEG, PNG, GIF, PDF, TXT files — max size **10 MB**.

---

## Scripts

### Backend

| Command | Description |
|---------|-----------|
| `npm run dev` | Development with hot-reload |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Production (`node dist/main`) |
| `npm run test` | Unit tests (Jest) |
| `npm run lint` | ESLint + Prettier |

### Frontend

| Command | Description |
|---------|-----------|
| `npm run dev` | Development (port 3001) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

---

## Deploy

1. Set environment variables in the target environment.
2. Run `npm run build` in each package.
3. Start the backend with `npm run start:prod` (or containerize).
4. Deploy the frontend to Vercel, Netlify, or your own server — point `NEXT_PUBLIC_API_URL` to the backend production URL.
5. Configure S3 bucket **CORS** to allow the frontend origin.

---

## Contributing

1. Fork the repository.
2. Create a descriptive branch: `git checkout -b feat/my-feature`.
3. Commit using [Conventional Commits](https://www.conventionalcommits.org): `git commit -m "feat: add ..."`.
4. Run `npm run lint` to ensure style compliance.
5. Open a Pull Request to the `main` branch.

---

## License

MIT
