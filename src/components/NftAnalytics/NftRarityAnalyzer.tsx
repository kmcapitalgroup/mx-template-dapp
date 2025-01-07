import React, { useState } from 'react';
import { useGetAccount } from '@multiversx/sdk-dapp/hooks';
import axios from 'axios';
import type { WidgetProps } from '../../types/widget.types';
import ServiceButton from '../ServiceAccess/ServiceButton';
import PricingInfo from '../ServiceAccess/PricingInfo';

interface NftRarityScore {
  nftId: string;
  rarityScore: number;
  attributes: Record<string, string>;
}

interface AnalysisStatus {
  message: string;
  type: 'success' | 'error' | 'info';
}

export const NftRarityAnalyzer = ({ callbackRoute }: WidgetProps) => {
  const { address } = useGetAccount();
  const [nftScores, setNftScores] = useState<NftRarityScore[]>([]);
  const [status, setStatus] = useState<AnalysisStatus | null>(null);
  const [nftId, setNftId] = useState<string>('');

  const analyzeNftRarity = async () => {
    try {
      const response = await axios.post('/api/nft/rarity', {
        nftId,
        address
      });

      if (response.data) {
        setNftScores([...nftScores, response.data]);
        setStatus({ 
          message: 'Analysis completed successfully',
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Error analyzing NFT:', error);
      setStatus({
        message: 'Failed to analyze NFT',
        type: 'error'
      });
    }
  };

  const handleAnalysisSuccess = () => {
    if (!nftId) {
      setStatus({
        message: 'Please enter an NFT ID',
        type: 'error'
      });
      return;
    }
    analyzeNftRarity();
  };

  const getStatusClassName = (type: AnalysisStatus['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      default:
        return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <PricingInfo />
      </div>

      <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-4">NFT Rarity Analyzer</h2>
        
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="text"
              value={nftId}
              onChange={(e) => setNftId(e.target.value)}
              placeholder="Enter NFT ID to analyze rarity..."
              className="mx-input flex-1"
            />
          </div>

          <ServiceButton
            serviceType="rarityCheck"
            onSuccess={handleAnalysisSuccess}
          />

          {status && (
            <div className={`mt-4 p-4 rounded-lg ${getStatusClassName(status.type)}`}>
              <p>{status.message}</p>
            </div>
          )}
        </div>

        <div className="mx-grid mt-6">
          {nftScores.map((score) => (
            <div key={score.nftId} className="mx-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="mx-gradient-text text-xl">NFT #{score.nftId}</h3>
                <div className="mx-stat-card px-3 py-1">
                  <span className="mx-stat-value text-lg">{score.rarityScore.toFixed(2)}</span>
                  <span className="mx-stat-label">Rarity Score</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Attributes</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(score.attributes).map(([key, value]) => (
                    <div key={key} className="mx-stat-card">
                      <span className="mx-stat-label capitalize">{key}</span>
                      <span className="mx-stat-value text-lg">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
