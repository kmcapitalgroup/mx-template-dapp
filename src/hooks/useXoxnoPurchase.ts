import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks';
import { sendTransactions } from '@multiversx/sdk-dapp/services';
import { refreshAccount } from '@multiversx/sdk-dapp/utils';
import { Address } from '@multiversx/sdk-core/out';
import { useState, useEffect } from 'react';
import { TIKAW_TOKENS } from '../constants/serviceCosts';

interface XoxnoListing {
  identifier: string;
  collection: string;
  nonce: number;
  price: string;
  attributes: Record<string, string>;
  marketplaceKey: string;
}

interface NFTListing {
  identifier: string;
  price: string;
  priceInEgld: number;
}

export const useXoxnoPurchase = () => {
  const { address } = useGetAccountInfo();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listings, setListings] = useState<NFTListing[]>([]);
  const [tikawListings, setTikawListings] = useState<XoxnoListing[]>([]);

  const MULTIVERSX_API = 'https://api.multiversx.com';
  const XOXNO_MARKETPLACE = 'erd1qqqqqqqqqqqqqpgqhe8t5jewej70zupmh44jurgn29psua5l2jps3ntjj3';
  const XOXNO_NFT_URL = 'https://xoxno.com/nft/TIKAWULTRA-e6592a-01';
  const XEXCHANGE_XTW_URL = 'https://xexchange.com/tokens/XTW-78700a?firstToken=EGLD&secondToken=XTW-78700a';
  const COLLECTION_IDENTIFIER = 'TIKAWULTRA-e6592a';
  const PRICE_IN_EGLD = 0.5;

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${MULTIVERSX_API}/nfts?collection=${COLLECTION_IDENTIFIER}&withSupply=true`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }

        const data = await response.json();
        
        // Filter and map NFTs that are listed on XOXNO
        const activeListings = data
          .filter((nft: any) => nft.marketplaceData?.marketplace === 'xoxno' && nft.marketplaceData?.active)
          .map((nft: any) => ({
            identifier: nft.identifier,
            price: nft.marketplaceData.price,
            priceInEgld: parseFloat(nft.marketplaceData.price) / Math.pow(10, 18) || 0
          }))
          .sort((a: NFTListing, b: NFTListing) => 
            parseFloat(a.price) - parseFloat(b.price)
          );

        setListings(activeListings);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch listings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  const fetchTikawUltraListings = async (): Promise<XoxnoListing[]> => {
    try {
      // Fetch all NFTs from the collection that are in the XOXNO marketplace
      const response = await fetch(
        `${MULTIVERSX_API}/nfts?collection=${TIKAW_TOKENS.ultraPass.collection}&withSupply=true&withScamInfo=true`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch TIKAWULTRA Pass listings');
      }

      const nfts = await response.json();
      
      // Filter NFTs that are listed on XOXNO
      const listedNfts = nfts.filter((nft: any) => {
        const marketplaceData = nft.marketplaceData;
        return marketplaceData && 
               marketplaceData.marketplace === 'xoxno' && 
               marketplaceData.active;
      });

      // Map to our listing format
      const tikawListings = listedNfts.map((nft: any) => ({
        identifier: nft.identifier,
        collection: nft.collection,
        nonce: nft.nonce,
        price: nft.marketplaceData.price,
        attributes: nft.attributes || {},
        marketplaceKey: nft.marketplaceData.key
      }));

      setTikawListings(tikawListings);
      return tikawListings;
    } catch (error) {
      console.error('Error fetching listings:', error);
      throw new Error('Failed to fetch available passes');
    }
  };

  const purchasePass = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!address) {
        throw new Error('Please connect your wallet first');
      }

      // Fetch available listings
      const listings = await fetchTikawUltraListings();
      if (listings.length === 0) {
        throw new Error('No TIKAWULTRA Pass available for purchase');
      }

      // Get the cheapest listing
      const cheapestListing = listings.reduce((prev, curr) => 
        BigInt(prev.price) < BigInt(curr.price) ? prev : curr
      );

      // Prepare buy transaction for XOXNO marketplace
      const buyTx = {
        value: cheapestListing.price,
        data: Buffer.from(
          `buy@${cheapestListing.marketplaceKey}`,
          'utf8'
        ).toString('base64'),
        receiver: new Address(XOXNO_MARKETPLACE),
        gasLimit: 60000000
      };

      await refreshAccount();
      const { sessionId } = await sendTransactions({
        transactions: buyTx,
        transactionsDisplayInfo: {
          processingMessage: 'Processing TIKAWULTRA Pass purchase',
          errorMessage: 'An error occurred during purchase',
          successMessage: 'TIKAWULTRA Pass purchased successfully'
        }
      });

      return { sessionId, price: cheapestListing.price };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to purchase TIKAWULTRA Pass';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const redirectToXoxno = () => {
    window.open(XOXNO_NFT_URL, '_blank');
  };

  const redirectToXExchange = () => {
    window.open(XEXCHANGE_XTW_URL, '_blank');
  };

  return {
    purchasePass,
    redirectToXoxno,
    redirectToXExchange,
    listings,
    tikawListings,
    isLoading,
    error,
    priceInEgld: PRICE_IN_EGLD
  };
};
