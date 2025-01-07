import React, { useState } from 'react';
import { useServiceAccess } from '../../hooks/useServiceAccess';
import { useXoxnoPurchase } from '../../hooks/useXoxnoPurchase';
import { ServiceCosts } from '../../constants/serviceCosts';

interface ServiceButtonProps {
  serviceType: keyof typeof ServiceCosts.features;
  onSuccess: () => void;
}

const ServiceButton: React.FC<ServiceButtonProps> = ({ serviceType, onSuccess }) => {
  const { checkServiceAccess, executeService, isProcessing } = useServiceAccess(serviceType);
  const { redirectToXoxno, redirectToXExchange, priceInEgld } = useXoxnoPurchase();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClick = async () => {
    try {
      const { canAccess, message } = await checkServiceAccess();
      
      if (!canAccess) {
        setErrorMessage(message);
        setShowPaymentModal(true);
        return;
      }

      await executeService();
      onSuccess();
    } catch (error) {
      console.error(error instanceof Error ? error.message : 'Failed to execute service');
      setErrorMessage('Failed to execute service');
      setShowPaymentModal(true);
    }
  };

  const handleGetPass = () => {
    redirectToXoxno();
    setShowPaymentModal(false);
  };

  const handleGetXTW = () => {
    redirectToXExchange();
    setShowPaymentModal(false);
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isProcessing}
        className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" />
            Processing...
          </div>
        ) : (
          `Execute (${ServiceCosts.features[serviceType]} XTW)`
        )}
      </button>

      {showPaymentModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
            
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">Service Access Required</h3>
              {errorMessage && (
                <p className="text-red-600 dark:text-red-400 mb-4">{errorMessage}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                <h4 className="font-semibold mb-2">💎 Get TIKAWULTRA Pass</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Unlock unlimited lifetime access to all features! No more per-analysis payments required.
                </p>
                <button
                  onClick={handleGetPass}
                  className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex justify-between items-center"
                >
                  <span>Buy TIKAWULTRA Pass</span>
                  <span className="font-mono">{priceInEgld?.toFixed(2) || '0.50'} EGLD</span>
                </button>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <h4 className="font-semibold mb-2">🪙 Get XTW Tokens</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Need {ServiceCosts.features[serviceType]} XTW for this analysis? Swap EGLD for XTW tokens on xExchange.
                </p>
                <button
                  onClick={handleGetXTW}
                  className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex justify-between items-center"
                >
                  <span>Swap on xExchange</span>
                  <span className="text-sm text-gray-600">EGLD → XTW</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ServiceButton;
