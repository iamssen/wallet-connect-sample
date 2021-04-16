import React, { useState } from 'react';
import { useWallet } from 'wallet/context/wallet';
import QrReader from 'react-qr-reader';

export function InitSession() {
  const { init } = useWallet();

  const [uri, setUri] = useState<string>('');

  const [qrscan, setQrscan] = useState<boolean>(false);

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

      {qrscan && (
        <QrReader
          delay={300}
          onError={console.error}
          onScan={(data) => {
            if (data) {
              setUri(data);
              setQrscan(false);
            }
          }}
          style={{ width: '100%' }}
        />
      )}

      <footer style={{ marginTop: 30 }}>
        <button onClick={() => setQrscan((prev) => !prev)}>QR Scan</button>

        <button disabled={uri.length === 0} onClick={() => init(uri)}>
          Connect
        </button>
      </footer>
    </section>
  );
}
