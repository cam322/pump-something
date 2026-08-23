/**
 * Pump Something Project Configuration
 * All official project URLs and constants
 */

export const PROJECT_CONFIG = {
  name: "Pump Something",
  ticker: "$SOMETHING",
  network: "Solana",
  contractAddress: "HSMwLiADMPDqvL1zy2qgaBTFpRHGij7NoCRkJDapump",
  
  // Official URLs
  pumpfunUrl: "https://pump.fun/coin/HSMwLiADMPDqvL1zy2qgaBTFpRHGij7NoCRkJDapump",
  telegramUrl: "https://t.me/pumpsomething",
  xUrl: "", // TODO: Add X/Twitter URL when provided
  
  // Derived URLs
  get contractDisplay() {
    return this.contractAddress;
  },
  
  get verifiedLinks() {
    return {
      telegram: this.telegramUrl,
      pumpfun: this.pumpfunUrl,
      contract: this.contractAddress,
      x: this.xUrl,
    };
  }
} as const;

export type ProjectConfig = typeof PROJECT_CONFIG;