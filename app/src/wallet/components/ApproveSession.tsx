import React, { useState } from 'react';
import { useWallet } from 'wallet/context/wallet';

export function ApproveSession() {
  const { approveSession, rejectSession, peerMeta } = useWallet();

  const [mnemonic, setMnemonic] = useState<string>(
    process.env.REACT_APP_TEST_MNEMONIC ?? '',
  );

  return (
    <section>
      <pre>
        {peerMeta
          ? JSON.stringify(peerMeta, null, 2)
          : 'Waiting session_request'}
      </pre>

      <h2>Mnemonic</h2>
      <textarea
        value={mnemonic}
        onChange={({ target }) => setMnemonic(target.value)}
        style={{ minWidth: 600, minHeight: 70 }}
      />

      <footer>
        <button disabled={!peerMeta} onClick={() => approveSession(mnemonic)}>
          Approve Session
        </button>

        <button disabled={!peerMeta} onClick={() => rejectSession()}>
          Reject Session
        </button>
      </footer>
    </section>
  );
}
