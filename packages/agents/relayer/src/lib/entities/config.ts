import { Type, Static } from "@sinclair/typebox";

import { TAddress } from "@connext/nxtp-utils";

export const TChainConfig = Type.Object({
  providers: Type.Array(Type.String()),
  deployments: Type.Object({
    transactionManager: TAddress,
  }),
});

export type ChainConfig = Static<typeof TChainConfig>;

export const TServerConfig = Type.Object({
  port: Type.Integer({ minimum: 1, maximum: 65535 }),
  host: Type.String({ format: "ipv4" }),
});

export const RelayerConfigSchema = Type.Object({
  chains: Type.Record(Type.String(), TChainConfig),
  logLevel: Type.Union([
    Type.Literal("fatal"),
    Type.Literal("error"),
    Type.Literal("warn"),
    Type.Literal("info"),
    Type.Literal("debug"),
    Type.Literal("trace"),
    Type.Literal("silent"),
  ]),
  network: Type.Union([Type.Literal("testnet"), Type.Literal("mainnet"), Type.Literal("local")]),
  server: TServerConfig,
});

export type RelayerConfig = Static<typeof RelayerConfigSchema>;
