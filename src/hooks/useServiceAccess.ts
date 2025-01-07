import { useGetAccountInfo, useGetPendingTransactions } from '@multiversx/sdk-dapp/hooks';
import { sendTransactions } from '@multiversx/sdk-dapp/services';
import { refreshAccount } from '@multiversx/sdk-dapp/utils';
import { Address, TokenPayment } from '@multiversx/sdk-core/out';
import { useState } from 'react';
import { ServiceCosts, TIKAW_TOKENS } from '../constants/serviceCosts';

const BURN_SC_ADDRESS = 'erd1...'; // Adresse du smart contract de burn

interface ServiceAccessResult {
  canAccess: boolean;
  message: string;
}

export const useServiceAccess = (serviceType: keyof typeof ServiceCosts.features) => {
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const [isProcessing, setIsProcessing] = useState(false);

  const checkUltraPass = async (userAddress: string): Promise<boolean> => {
    try {
      const apiUrl = 'https://api.multiversx.com';
      const response = await fetch(
        `${apiUrl}/accounts/${userAddress}/nfts?collection=${TIKAW_TOKENS.ultraPass.collection}`
      );
      const nfts = await response.json();
      return nfts.length > 0;
    } catch (error) {
      console.error('Failed to check Ultra Pass:', error);
      return false;
    }
  };

  const checkXtwBalance = async (userAddress: string, requiredAmount: number): Promise<boolean> => {
    try {
      const apiUrl = 'https://api.multiversx.com';
      const response = await fetch(
        `${apiUrl}/accounts/${userAddress}/tokens/${TIKAW_TOKENS.xtw.identifier}`
      );
      const tokenData = await response.json();
      const balance = parseInt(tokenData.balance) / Math.pow(10, TIKAW_TOKENS.xtw.decimals);
      return balance >= requiredAmount;
    } catch (error) {
      console.error('Failed to check XTW balance:', error);
      return false;
    }
  };

  const checkServiceAccess = async (): Promise<ServiceAccessResult> => {
    if (!address) {
      return { canAccess: false, message: 'Please connect your wallet' };
    }

    if (hasPendingTransactions) {
      return { canAccess: false, message: 'Please wait for pending transactions' };
    }

    // Vérifier d'abord si l'utilisateur a un TIKAWULTRA Pass
    const hasUltraPass = await checkUltraPass(address);
    if (hasUltraPass) {
      return { canAccess: true, message: 'Access granted with TIKAWULTRA Pass' };
    }

    // Sinon, vérifier le solde XTW
    const requiredAmount = ServiceCosts.features[serviceType];
    const hasEnoughXtw = await checkXtwBalance(address, requiredAmount);
    
    if (!hasEnoughXtw) {
      return {
        canAccess: false,
        message: `Insufficient XTW balance. Required: ${requiredAmount} XTW`
      };
    }

    return { canAccess: true, message: `Will burn ${requiredAmount} XTW` };
  };

  const burnTokens = async (amount: number) => {
    const tx = {
      value: 0,
      data: 'burnTokens',
      receiver: new Address(BURN_SC_ADDRESS),
      gasLimit: 60000000,
      payments: [
        TokenPayment.fungibleFromAmount(
          TIKAW_TOKENS.xtw.identifier,
          amount,
          TIKAW_TOKENS.xtw.decimals
        )
      ]
    };

    await refreshAccount();
    const { sessionId } = await sendTransactions({
      transactions: tx,
      transactionsDisplayInfo: {
        processingMessage: 'Processing burn transaction',
        errorMessage: 'An error occurred during burning',
        successMessage: 'Tokens burned successfully'
      }
    });

    return sessionId;
  };

  const executeService = async (): Promise<boolean> => {
    setIsProcessing(true);
    try {
      const { canAccess, message } = await checkServiceAccess();
      
      if (!canAccess) {
        throw new Error(message);
      }

      if (await checkUltraPass(address)) {
        return true;
      }

      await burnTokens(ServiceCosts.features[serviceType]);
      return true;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    checkServiceAccess,
    executeService,
    isProcessing
  };
};
