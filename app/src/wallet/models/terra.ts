import { MnemonicKey } from '@terra-money/terra.js';

export interface TerraWallet {
  privateKey: string;
  publicKey: string;
  terraAddress: string;
}

export function createTerraWallet(mnemonic: string): TerraWallet {
  const mk = new MnemonicKey({ mnemonic, coinType: 330 });
  
  return {
    privateKey: mk.privateKey.toString('hex'),
    publicKey: mk.publicKey?.toString('hex') ?? '',
    terraAddress: mk.accAddress,
  };
}
