import React, { useCallback, useState } from 'react';
import { useWallet } from 'wallet/context/wallet';
import { createTerraWallet } from 'wallet/models/terra';

export function Request() {
  const { request, approveRequest, rejectRequest } = useWallet();

  const [mnemonic, setMnemonic] = useState<string>(
    process.env.REACT_APP_TEST_MNEMONIC ?? '',
  );

  const approve = useCallback(() => {
    const draftTerraWallet = createTerraWallet(mnemonic);
    approveRequest(request!, draftTerraWallet.privateKey);
  }, [approveRequest, mnemonic, request]);

  if (!request) return null;

  return (
    <section>
      <h2>Request</h2>
      <pre>{JSON.stringify(request, null, 2)}</pre>

      <h2>Mnemonic</h2>
      <textarea
        value={mnemonic}
        onChange={({ target }) => setMnemonic(target.value)}
        style={{ minWidth: 600, minHeight: 70 }}
      />

      <footer>
        <button onClick={approve}>Approve</button>
        <button onClick={() => rejectRequest(request)}>Reject</button>
      </footer>
    </section>
  );
}
