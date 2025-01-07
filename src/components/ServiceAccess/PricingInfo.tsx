import React from 'react';
import { ServiceCosts } from '../../constants/serviceCosts';

const PricingInfo: React.FC = () => {
  const handleBuyOnXoxno = () => {
    window.open('https://xoxno.com/collection/TIKAWULTRA-e6592a', '_blank');
  };

  return (
    <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Pay-per-use</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Burn XTW tokens per action</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">From 150 XTW</p>
            <p className="text-sm text-gray-500">per analysis</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Unlimited Access</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">With TIKAWULTRA Pass</p>
          </div>
          <button
            onClick={handleBuyOnXoxno}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Buy on Xoxno
          </button>
        </div>

        <div className="pt-4">
          <h4 className="font-semibold mb-2">Service Costs (XTW)</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span>NFT Analysis</span>
              <span className="font-medium">{ServiceCosts.features.nftAnalysis} XTW</span>
            </li>
            <li className="flex justify-between">
              <span>Rarity Check</span>
              <span className="font-medium">{ServiceCosts.features.rarityCheck} XTW</span>
            </li>
            <li className="flex justify-between">
              <span>Price Prediction</span>
              <span className="font-medium">{ServiceCosts.features.pricePredictor} XTW</span>
            </li>
            <li className="flex justify-between">
              <span>Market Insights</span>
              <span className="font-medium">{ServiceCosts.features.marketInsights} XTW</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PricingInfo;
