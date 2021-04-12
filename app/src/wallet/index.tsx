import React from 'react';
import { render } from 'react-dom';
import { ApproveSession } from 'wallet/components/ApproveSession';
import { Connected } from 'wallet/components/Connected';
import { InitSession } from 'wallet/components/InitSession';
import { Request } from 'wallet/components/Request';
import { useWallet, WalletProvider } from 'wallet/context/wallet';

function Main() {
  const { request, connector, connected } = useWallet();

  // Tx 요청이 있는 경우 Tx 처리 페이지를 보여줌
  if (!!request) {
    return <Request />;
  }

  // 연결된 WalletConnect 가 없는 경우 초기 연결 페이지 보여줌
  if (!connected && !connector) {
    return <InitSession />;
  }

  // WalletConnect 생성 되었더라도
  // session_request 의 Approve / Reject 를 처리해야 함
  if (!connected) {
    return <ApproveSession />;
  }

  // 모든 처리가 된 경우 Session 상태를 보여줌
  return <Connected />;
}

render(
  <WalletProvider>
    <Main />
  </WalletProvider>,
  document.querySelector('#app'),
);

// Hot Module Replacement
if (module.hot) {
  module.hot.accept();
}
