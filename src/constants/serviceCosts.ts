export const ServiceCosts = {
  features: {
    nftAnalysis: 150,     // 150 XTW - Analyse de base
    rarityCheck: 200,     // 200 XTW - Vérification de rareté détaillée
    pricePredictor: 250,  // 250 XTW - Prédiction de prix avancée
    marketInsights: 300   // 300 XTW - Analyse de marché complète
  }
} as const;

export const TIKAW_TOKENS = {
  xtw: {
    identifier: 'XTW-78700a',
    decimals: 18
  },
  ultraPass: {
    collection: 'TIKAWULTRA-e6592a'
  }
} as const;
