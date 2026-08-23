export function Footer() {
  return (
    <footer className="bg-black border-t border-green-500/20 py-12">
      <div className="container mx-auto px-4 text-center">
        {/* Brand */}
        <div className="mb-8">
          <h3 className="text-4xl font-black text-green-400 mb-2 neon-glow">
            PUMP SOMETHING
          </h3>
          <p className="text-white/70 text-lg">
            The internet is always doing something. Let&apos;s meme it.
          </p>
        </div>

        {/* Tagline */}
        <div className="text-white/60 mb-8">
          <span className="text-green-400">$SOMETHING</span> •{" "}
          <span className="text-cyan-400">SOLANA</span> •{" "}
          <span className="text-green-300">COMMUNITY POWERED</span>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-6 mb-8">
          {/* Telegram */}
          <a
            href="https://t.me/pumpsomething"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-green-400 transition-colors"
            aria-label="Telegram"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 5.303 3.437 9.8 8.25 11.414.6.111.82-.261.82-.58 0-.286-.01-1.066-.015-2.066-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.205.084 1.839 1.235 1.839 1.235 1.07 1.834 2.807 1.304 3.492.998.107-.775.418-1.304.76-1.604-2.665-.304-5.466-1.332-5.466-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.012-.404 1.027.005 2.056.138 3.013.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.807 5.624-5.493 5.918.434.373.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.698.825.58C20.566 17.8 24 13.303 24 8 24 5.373 18.627 0 12 0z" />
            </svg>
          </a>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-green-500/10 pt-6 text-white/50 text-sm">
          <p>
            $SOMETHING is a meme token created for entertainment and community purposes. Nothing on this website constitutes financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}