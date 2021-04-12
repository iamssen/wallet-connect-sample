import { Connected } from 'app/components/Connected';
import { InitSession } from 'app/components/InitSession';
import { AppProvider, useApp } from 'app/context/app';
import React from 'react';
import { render } from 'react-dom';

function Main() {
  const { connector } = useApp();

  // 연결된 WalletConnect가 없는 경우 초기 연결 페이지 보여줌
  if (!connector) {
    return <InitSession />;
  }

  // 연결이 된 경우, 간단한 Tx 를 처리할 수 있는 테스트 페이지 보여줌
  return <Connected />;
}

render(
  <AppProvider>
    <Main />
  </AppProvider>,
  document.querySelector('#app'),
);

// Hot Module Replacement
if (module.hot) {
  module.hot.accept();
}
