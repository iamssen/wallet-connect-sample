import {
  CreateTxOptions,
  isTxError,
  LCDClient,
  Msg,
  RawKey,
  StdFee,
} from '@terra-money/terra.js';
import WalletConnect from '@walletconnect/client';
import { IClientMeta, IJsonRpcRequest } from '@walletconnect/types';
import React, {
  Consumer,
  Context,
  createContext,
  ReactNode,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createTerraWallet, TerraWallet } from 'wallet/models/terra';

export interface WalletProviderProps {
  children: ReactNode;
}

export interface Wallet {
  connector: WalletConnect | null;
  peerMeta: IClientMeta | null;
  connected: boolean;
  init: (uri: string) => void;
  approveSession: (mnemonic: string) => void;
  rejectSession: () => void;
  request: IJsonRpcRequest | null;
  approveRequest: (request: IJsonRpcRequest, privateKey: string) => void;
  rejectRequest: (request: IJsonRpcRequest) => void;
  terraWallet: RefObject<TerraWallet | null>;
}

// @ts-ignore
const WalletContext: Context<Wallet> = createContext<Wallet>();

export function WalletProvider({ children }: WalletProviderProps) {
  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const [connector, setConnector] = useState<WalletConnect | null>(null);
  const [peerMeta, setPeerMeta] = useState<IClientMeta | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [request, setRequest] = useState<IJsonRpcRequest | null>(null);
  // Terra Wallet 은 현재 테스트용으로 대충 처리하고 있음
  const terraWallet = useRef<TerraWallet | null>(null);

  // ---------------------------------------------
  // Wallet 의 Session 시작
  // 현재 Wallet 에서는 wc:... 를 수동으로 입력해서 시작하고 있음
  // ---------------------------------------------
  // App 의 URI (wc:...) 를 입력받아서 연결을 시작한다
  // 연결을 시작하면 connector.on('session_request') 로 요청이 들어오게 된다
  const init = useCallback(async (uri: string) => {
    const draftConnector = new WalletConnect({ uri });

    if (!draftConnector.connected) {
      await draftConnector.createSession();
    }

    setConnector(draftConnector);
  }, []);

  // ---------------------------------------------
  // App -> Wallet 의 Session 접속 처리
  // ---------------------------------------------
  // Session 접속 허용
  // Wallet 처리는 간이로 처리하고 있다
  const approveSession = useCallback(
    (mnemonic: string) => {
      if (!connector) throw new Error('Undefined connector!');

      const draftTerraWallet = createTerraWallet(mnemonic);
      terraWallet.current = draftTerraWallet;

      connector.approveSession({
        chainId: 1,
        accounts: [draftTerraWallet.terraAddress],
      });
      setConnected(true);
    },
    [connector],
  );

  // Session 접속 거부
  const rejectSession = useCallback(() => {
    if (!connector) throw new Error('Undefined connector!');
    connector.rejectSession();
    setConnected(false);
  }, [connector]);

  // ---------------------------------------------
  // App -> Wallet 의 Request 처리
  // ---------------------------------------------
  // Request 요청 허용
  // 현재 샘플에서는 LCDClient 로 간단하게 처리하고 있다
  const approveRequest = useCallback(
    async (req: IJsonRpcRequest, privateKey: string) => {
      const tx = req.params[0];

      const lcd = new LCDClient({
        chainID: 'tequila-0004',
        URL: 'https://tequila-lcd.terra.dev',
        gasPrices: req.params[0].gasPrices,
        gasAdjustment: req.params[0].gasAdjustment,
      });

      const key = new RawKey(Buffer.from(privateKey, 'hex'));

      lcd
        .wallet(key)
        .createAndSignTx({
          ...tx,
          msgs: tx.msgs.map((msg: any) => Msg.fromData(JSON.parse(msg))),
          fee: tx.fee ? StdFee.fromData(JSON.parse(tx.fee)) : undefined,
        } as CreateTxOptions)
        .then((signed) => lcd.tx.broadcastSync(signed))
        .then((data) => {
          if (isTxError(data)) {
            connector?.rejectRequest({
              id: req.id,
              error: {
                message: 'Tx Error',
              },
            });
          } else {
            connector?.approveRequest({
              id: req.id,
              result: data,
            });
          }
        })
        .finally(() => {
          setRequest(null);
        });
    },
    [connector],
  );

  // Request 요청 거부
  const rejectRequest = useCallback(
    async (req: IJsonRpcRequest) => {
      connector?.rejectRequest({
        id: req.id,
        error: {
          code: 20000,
          message: 'txerror...',
        },
      });

      setRequest(null);
    },
    [connector],
  );

  // ---------------------------------------------
  // WalletConnect Event Listeners
  // ---------------------------------------------
  useEffect(() => {
    if (!connector) return;

    // App 에서 접속 요청이 오는 경우
    // UI 쪽에서 Approve / Reject 를 처리한 다음
    // approveSession() / rejectSession() 으로 결과를 받는다
    connector.on('session_request', (error, payload) => {
      console.log('EVENT', 'session_request', error, payload);
      if (error) throw error;

      // peerMeta (접속 App 정보) 를 세팅해서 UI 에서 처리화면이 뜨도록 한다
      setPeerMeta(payload.params[0]);
    });

    // ? : 테스트 상에서 발생되지 않고 있음
    connector.on('session_update', (error) => {
      console.log('EVENT', 'session_update', error);
      if (error) throw error;
    });

    // App 에서 Tx 요청이 오는 경우
    // UI 쪽에서 Approve / Reject 를 처리한 다음
    // approveRequest() / rejectRequest() 로 결과를 받는다
    connector.on('call_request', async (error, payload) => {
      //console.log('EVENT', 'call_request', payload);

      if (error) throw error;

      if (payload.method === 'ping') {
        connector.approveRequest({
          id: payload.id,
          result: {
            success: true,
          },
        });
      } else if (payload.method === 'terra') {
        // request 를 세팅해서 UI 에서 처리화면이 뜨도록 한다
        setRequest(payload);
      }
    });

    // ? : 테스트 상에서 발생되지 않고 있음
    connector.on('connect', (error, payload) => {
      console.log('EVENT', 'connect', error, payload);

      if (error) throw error;
    });

    // App 에서 disconnect 가 발생될때
    // WalletConnect() 의 연결 자체가 끊어지므로 State 도 지워준다
    connector.on('disconnect', (error, payload) => {
      console.log('EVENT', 'disconnect', error, payload);

      if (error) throw error;

      setConnector(null);
      setPeerMeta(null);
      setConnected(false);
    });

    setInterval(() => {
      if (!connector) {
        throw new Error('connector is undefined!!');
      }

      Promise.race([
        connector.sendCustomRequest({
          id: Date.now(),
          method: 'ping',
        }),
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: false }), 1000 * 10),
        ),
      ]).then((result) => {
        console.log('connect.ts..()', result);
      });
    }, 1000 * 30);
  }, [connected, connector, peerMeta]);

  // ---------------------------------------------
  // 초기화
  // ---------------------------------------------
  useEffect(() => {
    // Wallet Connect 는 연결이 되면 localStorage 에 Session 이 저장된다
    const cachedSession = localStorage
      ? localStorage.getItem('walletconnect')
      : null;

    if (typeof cachedSession === 'string') {
      try {
        // 저장된 Session이 있으면 복구한다
        const draftConnector = new WalletConnect({
          session: JSON.parse(cachedSession),
        });
        const draftPeerMeta = draftConnector.peerMeta;

        setConnector(draftConnector);
        setPeerMeta(draftPeerMeta);
        setConnected(draftConnector.connected);
      } catch {}
    }
  }, []);

  const state = useMemo<Wallet>(
    () => ({
      terraWallet,
      connector,
      peerMeta,
      connected,
      init,
      approveSession,
      rejectSession,
      request,
      approveRequest,
      rejectRequest,
    }),
    [
      approveRequest,
      approveSession,
      connected,
      connector,
      init,
      peerMeta,
      rejectRequest,
      rejectSession,
      request,
    ],
  );

  return (
    <WalletContext.Provider value={state}>{children}</WalletContext.Provider>
  );
}

export function useWallet(): Wallet {
  return useContext(WalletContext);
}

export const WalletConsumer: Consumer<Wallet> = WalletContext.Consumer;
