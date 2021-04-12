import React, { useState } from 'react';
import { useWallet } from 'wallet/context/wallet';

export function InitSession() {
  const { init } = useWallet();

  const [uri, setUri] = useState<string>('');

  return (
    <section>
      <div>
        <h2>Wallet Connect URI (wc:...)</h2>
        <textarea
          value={uri}
          onChange={({ target }) => setUri(target.value)}
          style={{ minWidth: 600, minHeight: 70 }}
        />
      </div>

      <footer style={{ marginTop: 30 }}>
        <button disabled={uri.length === 0} onClick={() => init(uri)}>
          Connect
        </button>
      </footer>
    </section>
  );
}
