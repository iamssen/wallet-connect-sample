import WalletConnect from '@walletconnect/client';
import QRCodeModal from '@walletconnect/qrcode-modal';
import { IClientMeta } from '@walletconnect/types';
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

export interface AppProviderProps {
  children: ReactNode;
}

export interface App {
  connector: WalletConnect | null;
  peerMeta: IClientMeta | null;
  connected: boolean;
  init: () => void;
}

// @ts-ignore
const AppContext: Context<App> = createContext<App>();

export function AppProvider({ children }: AppProviderProps) {
  const [connector, setConnector] = useState<WalletConnect | null>(null);
  const [peerMeta, setPeerMeta] = useState<IClientMeta | null>(null);
  const [connected, setConnected] = useState<boolean>(false);

  // ---------------------------------------------
  // Session 시작
  // ---------------------------------------------
  const init = useCallback(async () => {
    const bridge = 'https://bridge.walletconnect.org';
    
    const draftConnector = new WalletConnect({
      bridge,
      qrcodeModal: QRCodeModal,
    });

    setConnector(draftConnector);

    if (!draftConnector.connected) {
      // createSession() 을 시작하면 Web 상에서는 QR 이 뜨게 되고,
      // Wallet 에서 접속 요청을 허용하면
      // connector.on('connect') 쪽으로 Event 가 들어온다
      await draftConnector.createSession();
    }
  }, []);

  // ---------------------------------------------
  // Wallet Connect Event Listeners
  // ---------------------------------------------
  useEffect(() => {
    if (!connector) return;

    // ? : 테스트 상에서 발생되지 않고 있음
    connector.on('session_update', async (error, payload) => {
      console.log(`connector.on("session_update")`);

      if (error) throw error;

      const { chainId, accounts } = payload.params[0];

      console.log('app.tsx..()', chainId, accounts);
    });

    // Wallet 에서 접속 요청을 허용하면 발생되는 Event
    connector.on('connect', (error, payload) => {
      console.log(`connector.on("connect")`);

      if (error) throw error;

      setPeerMeta(payload.params[0]);
      setConnected(true);
    });

    // Wallet 쪽에서 접속을 끊으면 발생되는 Event
    // WalletConnect 데이터가 모두 제거되므로
    // State 들 역시 지워준다
    connector.on('disconnect', (error, payload) => {
      console.log(`connector.on("disconnect")`);

      if (error) throw error;

      setConnector(null);
      setPeerMeta(null);
      setConnected(false);
    });
  }, [connector]);

  // ---------------------------------------------
  // 초기화
  // ---------------------------------------------
  useEffect(() => {
    const cachedSession = localStorage
      ? localStorage.getItem('walletconnect')
      : null;

    if (typeof cachedSession === 'string') {
      try {
        // Wallet 과 동일하게 Local Storage 측에 Session이 저장된다
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

  const state = useMemo<App>(
    () => ({
      init,
      connector,
      peerMeta,
      connected,
    }),
    [connected, connector, init, peerMeta],
  );

  return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
}

export function useApp(): App {
  return useContext(AppContext);
}

export const AppConsumer: Consumer<App> = AppContext.Consumer;
