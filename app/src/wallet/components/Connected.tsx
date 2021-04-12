import React from 'react';
import { useWallet } from 'wallet/context/wallet';

export function Connected() {
  const { connector } = useWallet();

  if (!connector) return null;

  return (
    <section>
      <h2>Wallet Connect Session - Wallet</h2>
      
      <pre>{JSON.stringify(connector.session, null, 2)}</pre>
      
      <footer>
        <button onClick={() => connector.killSession()}>Disconnect</button>
      </footer>
    </section>
  );
}
