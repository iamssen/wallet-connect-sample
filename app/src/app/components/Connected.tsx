import { MICRO } from '@anchor-protocol/notation';
import { useWalletConnect } from '@terra-money/terra-walletconnect-react';
import { SessionStatus } from '@terra-money/terra-walletconnect/types';
import {
  Coins,
  CreateTxOptions,
  Int,
  MsgExecuteContract,
  StdFee,
} from '@terra-money/terra.js';
import React, { useCallback, useState } from 'react';

export function Connected() {
  const { session, post, disconnect } = useWalletConnect();

  const [inProgress, setInProgress] = useState<boolean>(false);

  const deposit = useCallback(async () => {
    if (session.status !== SessionStatus.CONNECTED) return;

    setInProgress(true);

    try {
      // 테스트 Tx : Anchor $10 Deposit
      // app.anchorprotocol.com/earn 에서 데이터를 확인할 수 있다
      const tx: CreateTxOptions = {
        fee: new StdFee(
          6000000,
          new Coins({
            uusd: new Int(MICRO).toString(),
          }),
        ),
        gasAdjustment: 1.4,
        msgs: [
          new MsgExecuteContract(
            session.terraAddress, // terraAddress
            'terra15dwd5mj8v59wpj0wvt233mf5efdff808c5tkal',
            {
              deposit_stable: {},
            },
            new Coins({
              uusd: new Int(10 * MICRO).toString(),
            }),
          ),
        ],
      };

      const result = await post(tx);

      console.log('Connected.tsx..()', result);
    } catch (e) {
      debugger;
      console.error(e);
    } finally {
      setInProgress(false);
    }
  }, [post, session]);

  if (session.status !== SessionStatus.CONNECTED) {
    return null;
  }

  if (inProgress) {
    return <div>In Progress...</div>;
  }

  return (
    <section>
      <h2>Wallet Connect Session - App</h2>

      <pre
        style={{
          overflow: 'auto',
          maxHeight: 200,
          border: '1px solid black',
        }}
      >
        {JSON.stringify(session, null, 2)}
      </pre>

      <div style={{ marginBottom: 20 }}>
        <button onClick={deposit}>Anchor Deposit 10$</button>
      </div>

      <footer>
        <button onClick={() => disconnect()}>Disconnect</button>
      </footer>
    </section>
  );
}
