This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Sayfalar

- `/` — İzletiriz film sitesi (ana sayfa, `app/page.tsx`)
- `/thumbnail` — Viral YouTube thumbnail stüdyosu
- `/video` — AI anlatım videosu stüdyosu (senaryo + seslendirme + 2D animasyon → .webm)

## Vercel'e Deploy (Next.js — index.html GEREKMEZ)

Bu bir Next.js uygulamasıdır; Vercel otomatik algılar. Statik `index.html`
**gerekmez** (ana sayfa `app/page.tsx`'tir; kökteki eski `index.html` kullanılmaz).

1. Bu repoyu GitHub'a push et (zaten yapıldı).
2. [vercel.com/new](https://vercel.com/new) → bu repoyu **Import** et.
3. Framework otomatik **Next.js** seçilir; Build Command `next build`, ayar
   değiştirmene gerek yok. **Deploy**'a bas.
4. (Opsiyonel) Gerçek AI için: **Project Settings → Environment Variables**
   bölümüne `OPENAI_API_KEY` ekle, sonra yeniden deploy et. Bkz. `.env.example`.

> AI özellikleri anahtarsız da çalışır: thumbnail'de prompt'tan prosedürel
> arka plan, videoda iskelet senaryo + tarayıcı sesi (altyazılı) devreye girer.
> `OPENAI_API_KEY` eklersen gerçek AI görsel/senaryo/seslendirme aktifleşir.

### Yerelde çalıştırma

```bash
npm install
cp .env.example .env.local   # opsiyonel: OPENAI_API_KEY ekle
npm run dev                   # http://localhost:3000
```


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
