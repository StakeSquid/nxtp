import { utils, BigNumber } from "ethers";
import { createStubInstance, SinonStubbedInstance } from "sinon";
import { AuctionsCache, StoreManager, TransactionsCache } from "@connext/nxtp-adapters-cache";
import { SubgraphReader } from "@connext/nxtp-adapters-subgraph";
import { ChainReader, ConnextContractInterfaces } from "@connext/nxtp-txservice";
import { mkAddress, Logger, mock as _mock } from "@connext/nxtp-utils";
import { TransactionManagerInterface } from "@connext/nxtp-contracts/typechain-types/TransactionManager";
import { ConnextPriceOracleInterface } from "@connext/nxtp-contracts/typechain-types/ConnextPriceOracle";
import { TokenRegistryInterface } from "@connext/nxtp-contracts/typechain-types/TokenRegistry";
import { StableSwapInterface } from "@connext/nxtp-contracts/typechain-types/StableSwap";

import { SequencerConfig } from "../src/lib/entities";
import { AppContext } from "../src/lib/entities/context";

export const mock = {
  ..._mock,
  context: (): AppContext => {
    return {
      adapters: {
        subgraph: mock.adapter.subgraph(),
        cache: mock.adapter.cache(),
        chainreader: mock.adapter.chainreader(),
        contracts: mock.adapter.contracts(),
      },
      config: mock.config(),
      chainData: mock.chainData(),
      logger: new Logger({ name: "mock", level: process.env.LOG_LEVEL || "silent" }),
    };
  },
  config: (): SequencerConfig => ({
    chains: {
      [mock.chain.A]: {
        confirmations: 1,
        providers: ["http://example.com"],
        subgraph: {
          runtime: ["http://example.com"],
          analytics: ["http://example.com"],
          maxLag: 10,
        },
        deployments: {
          transactionManager: mkAddress("0xabcdef123"),
        },
      },
      [mock.chain.B]: {
        confirmations: 1,
        providers: ["http://example.com"],
        subgraph: {
          runtime: ["http://example.com"],
          analytics: ["http://example.com"],
          maxLag: 10,
        },
        deployments: {
          transactionManager: mkAddress("0xabcdef123"),
        },
      },
    },
    logLevel: "info",
    redisUrl: "redis://localhost:6379",
    server: {
      port: 3000,
      host: "localhost",
    },
    network: "testnet",
    auctionWaitTime: 1_000,
  }),
  adapter: {
    cache: (): SinonStubbedInstance<StoreManager> => {
      const cache = createStubInstance(StoreManager);
      const transactions = createStubInstance(TransactionsCache);
      const auctions = createStubInstance(AuctionsCache);
      // NOTE: if this override doesn't work, we should resort to just making a mock object with
      // these caches as properties.
      (cache as any).transactions = transactions;
      (cache as any).auctions = auctions;
      transactions.getLatestNonce.resolves(0);
      return cache;
    },
    subgraph: (): SinonStubbedInstance<SubgraphReader> => {
      const subgraph = createStubInstance(SubgraphReader);
      subgraph.getPreparedTransactions.resolves([]);
      subgraph.getTransactionsWithStatuses.resolves([]);
      return subgraph;
    },
    chainreader: (): SinonStubbedInstance<ChainReader> => {
      const chainreader = createStubInstance(ChainReader);
      chainreader.getBalance.resolves(utils.parseEther("1"));

      chainreader.getDecimalsForAsset.resolves(18);
      chainreader.getBlockTime.resolves(Math.floor(Date.now() / 1000));
      chainreader.calculateGasFee.resolves(BigNumber.from(100));
      chainreader.calculateGasFeeInReceivingToken.resolves(BigNumber.from(100));
      chainreader.calculateGasFeeInReceivingTokenForFulfill.resolves(BigNumber.from(120));
      chainreader.getTokenPrice.resolves(BigNumber.from(1));
      chainreader.getGasEstimate.resolves(BigNumber.from(24001));

      const mockReceipt = mock.ethers.receipt();
      chainreader.getTransactionReceipt.resolves(mockReceipt);
      return chainreader;
    },
    contracts: (): SinonStubbedInstance<ConnextContractInterfaces> => {
      const encodedDataMock = "0xabcde";

      const transactionManager = createStubInstance(utils.Interface);
      transactionManager.encodeFunctionData.returns(encodedDataMock);
      transactionManager.decodeFunctionResult.returns([BigNumber.from(1000)]);

      const priceOracle = createStubInstance(utils.Interface);
      priceOracle.encodeFunctionData.returns(encodedDataMock);
      priceOracle.decodeFunctionResult.returns([BigNumber.from(1000)]);

      const tokenRegistry = createStubInstance(utils.Interface);
      tokenRegistry.encodeFunctionData.returns(encodedDataMock);
      tokenRegistry.decodeFunctionResult.returns([BigNumber.from(1000)]);

      const stableSwap = createStubInstance(utils.Interface);
      stableSwap.encodeFunctionData.returns(encodedDataMock);
      stableSwap.decodeFunctionResult.returns([BigNumber.from(1000)]);

      return {
        transactionManager: transactionManager as unknown as TransactionManagerInterface,
        priceOracle: priceOracle as unknown as ConnextPriceOracleInterface,
        tokenRegistry: tokenRegistry as unknown as TokenRegistryInterface,
        stableSwap: stableSwap as unknown as StableSwapInterface,
      };
    },
  },
};