import { MICRO } from '@anchor-protocol/notation';
import {
  Coins,
  CreateTxOptions,
  Int,
  MsgExecuteContract,
  StdFee,
} from '@terra-money/terra.js';
import { useApp } from 'app/context/app';
import React, { useCallback, useState } from 'react';

export function Connected() {
  const { connector } = useApp();

  const [inProgress, setInProgress] = useState<boolean>(false);

  const deposit = useCallback(async () => {
    if (!connector) return;

    setInProgress(true);

    try {
      console.log('Connected.tsx..()', connector.session.accounts[0]);

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
            connector.session.accounts[0], // terraAddress
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

      // ---------------------------------------------
      // WalletConnect.sendTransaction() 은 이더리움 전용으로 보인다 (이더리움 Tx Validator 처리가 됨)
      // Terra Tx 를 sendCustomRequest() 로 보낸다
      // ---------------------------------------------
      // Wallet 에서 Approve / Reject 응답이 올때까지 Promise 대기 상태가 된다
      const result = await connector.sendCustomRequest({
        // Request 의 Primary ID가 된다
        id: Date.now(),
        // 큰 의미는 없지만, 비워두면 에러가 난다
        method: 'terra',
        params: [
          // CreateTxOptions
          {
            msgs: tx.msgs.map((msg) => msg.toJSON()),
            fee: tx.fee?.toJSON(),
            memo: tx.memo,
            gasPrices: tx.gasPrices?.toString(),
            gasAdjustment: tx.gasAdjustment?.toString(),
            account_number: tx.account_number,
            sequence: tx.sequence,
            feeDenoms: tx.feeDenoms,
          },
        ],
      });

      console.log('Connected.tsx..()', result);
    } catch (e) {
      console.error(e);
    } finally {
      setInProgress(false);
    }
  }, [connector]);

  if (!connector) return null;

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
        {JSON.stringify(connector.session, null, 2)}
      </pre>

      <div style={{ marginBottom: 20 }}>
        <button onClick={deposit}>Anchor Deposit 10$</button>
      </div>

      <footer>
        <button onClick={() => connector.killSession()}>Disconnect</button>
      </footer>
    </section>
  );
}
