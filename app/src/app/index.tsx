import {
  useWalletConnect,
  WalletConnectProvider,
} from '@terra-money/terra-walletconnect-react';
import { SessionStatus } from '@terra-money/terra-walletconnect/types';
import { Connected } from 'app/components/Connected';
import { InitSession } from 'app/components/InitSession';
import React from 'react';
import { render } from 'react-dom';

function Main() {
  const { session } = useWalletConnect();

  // 연결된 WalletConnect가 없는 경우 초기 연결 페이지 보여줌
  if (session.status === SessionStatus.DISCONNECTED) {
    return <InitSession />;
  }

  if (session.status === SessionStatus.REQUESTED) {
    return <div>Waiting Session Connect...</div>;
  }

  // 연결이 된 경우, 간단한 Tx 를 처리할 수 있는 테스트 페이지 보여줌
  return <Connected />;
}

render(
  <WalletConnectProvider
    options={{ connectorOpts: { bridge: 'http://34.64.174.176:5001/' } }}
  >
    <Main />
  </WalletConnectProvider>,
  document.querySelector('#app'),
);

// Hot Module Replacement
if (module.hot) {
  module.hot.accept();
}
