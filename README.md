# Pump Something ($SOMETHING) Website

A community-powered meme project website built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Mobile-first responsive design**
- **Fast static site generation**
- **SEO optimized with Open Graph and Twitter cards**
- **No wallet connections or authentication**
- **Pure informational/community site**
- **Comic book + internet meme aesthetic**

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Turbopack (for dev)

## Project Structure

```
src/
├── app/           # Page routes
│   ├── page.tsx   # Home page
│   ├── about/     # About section
│   ├── token/     # Token information
│   ├── memes/     # Meme gallery
│   └── community/ # Community section
├── components/    # Reusable components
│   ├── Navigation.tsx
│   ├── Footer.tsx
│   ├── Mascot.tsx
│   ├── MemeGallery.tsx
│   └── CopyButton.tsx
├── config/
│   └── project.ts # Project configuration
└── data/
    └── memes.ts   # Meme gallery data
```

## Configuration

Edit `src/config/project.ts` to update:
- Contract address
- Pump.fun URL
- Telegram URL
- X/Twitter URL

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build
npm run build
```

## Vercel Deployment

### Quick Deploy

1. Fork/Clone this repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your Git repository
5. Vercel will auto-detect Next.js and configure correctly
6. Deploy!

### Manual Setup

If you need to configure specific settings:

1. **Framework Preset**: Next.js
2. **Build Command**: `npm run build`
3. **Output Directory**: `.next`
4. **Root Directory**: Leave empty (or `/src` if using src folder)

### Environment Variables

No environment variables required. All configuration is in `src/config/project.ts`.

### Custom Domain

1. Go to your project in Vercel Dashboard
2. Navigate to "Domains"
3. Add your custom domain (e.g., `snipr.vercel.app`)
4. Configure DNS records as shown
5. Vercel will provision SSL automatically

### Updating Content

To update the website:
1. Edit files in `src/`
2. Commit and push to your repository
3. Vercel will auto-rebuild and deploy

To update URLs or contract address:
1. Edit `src/config/project.ts`
2. Commit and push

To add new memes:
1. Add image files to `public/memes/`
2. Update `src/data/memes.ts` with new entries

## Important Files

- `src/config/project.ts` - All project URLs and contract address
- `src/data/memes.ts` - Meme gallery data (add your memes here)
- `public/memes/placeholder.png` - Placeholder for missing memes

## Security

This website:
- ❌ Does not connect wallets
- ❌ Does not request private keys
- ❌ Does not sign transactions
- ❌ Does not auto-connect
- ❌ Does not track users
- ❌ Does not use sketchy third-party scripts

## SEO

The site includes:
- Title: `Pump Something ($SOMETHING) | Solana Meme Community`
- Description: `The internet is always doing SOMETHING. $SOMETHING is a community-powered meme project built on Solana. Find something. Meme something. Create something.`
- Open Graph image at `/og-image.png`
- Twitter/X card metadata
- Favicon at `/favicon.ico`
- robots.txt
- sitemap.xml

## Live Deployment

**Production URL**: https://pumpsomething.vercel.app

## License

This is a community meme project. Do what you want with it.

## Support

Join our community: https://t.me/pumpsomething

**X/Twitter**: https://x.com/PumpSomething