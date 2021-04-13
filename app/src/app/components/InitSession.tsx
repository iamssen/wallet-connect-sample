import { useWalletConnect } from '@terra-money/terra-walletconnect-react';
import React from 'react';

export function InitSession() {
  const { connect } = useWalletConnect();

  return (
    <section>
      <button onClick={() => connect()}>Connect (Open QR)</button>
    </section>
  );
}
