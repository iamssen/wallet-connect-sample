import {
  connectWallet,
  connectWalletIfSessionExists,
  WalletConnectController,
  WalletConnectControllerOptions,
} from '@terra-money/terra-walletconnect';
import {
  Session,
  SessionStatus,
  TxResult,
} from '@terra-money/terra-walletconnect/types';
import { CreateTxOptions } from '@terra-money/terra.js';
import React, {
  Consumer,
  Context,
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export interface WalletConnectProviderProps {
  children: ReactNode;

  /**
   * Initialize parameters of `@terra-money/terra-walletconnect`
   */
  options?: WalletConnectControllerOptions;
}

export interface WalletConnectState {
  connect: () => void;
  disconnect: () => void;
  session: Session;
  post: (tx: CreateTxOptions) => Promise<TxResult>;
}

// @ts-ignore
const WalletConnectContext: Context<WalletConnectState> = createContext<WalletConnectState>();

export function WalletConnectProvider({
  children,
  options = {},
}: WalletConnectProviderProps) {
  const [client, setClient] = useState<WalletConnectController | null>(null);

  const [session, setSession] = useState<Session>(() => ({
    status: SessionStatus.DISCONNECTED,
  }));

  const connect = useCallback(() => {
    setClient(connectWallet(options));
  }, [options]);

  const disconnect = useCallback(() => {
    client?.disconnect();
  }, [client]);

  const post = useCallback(
    (tx: CreateTxOptions) => {
      if (!client) {
        throw new Error('Undefined client!');
      }

      return client.post(tx);
    },
    [client],
  );

  useEffect(() => {
    if (!client) return;

    const subscription = client.session().subscribe({
      next: (nextSession) => setSession(nextSession),
      error: (error) => {
        console.error(error);

        setClient(null);

        setSession({
          status: SessionStatus.DISCONNECTED,
        });
      },
      complete: () => {
        setClient(null);

        setSession({
          status: SessionStatus.DISCONNECTED,
        });
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [client]);

  useEffect(() => {
    const draftClient = connectWalletIfSessionExists(options);

    if (draftClient) {
      setClient(draftClient);
    }
  }, [options]);

  const state = useMemo<WalletConnectState>(
    () => ({
      connect,
      disconnect,
      post,
      session,
    }),
    [connect, disconnect, post, session],
  );

  return (
    <WalletConnectContext.Provider value={state}>
      {children}
    </WalletConnectContext.Provider>
  );
}

export function useWalletConnect(): WalletConnectState {
  return useContext(WalletConnectContext);
}

export const WalletConnectConsumer: Consumer<WalletConnectState> =
  WalletConnectContext.Consumer;
