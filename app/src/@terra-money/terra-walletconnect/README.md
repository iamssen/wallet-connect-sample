# `@terra-money/terra-walletconnect`

## API

<!-- source types.ts -->
<!-- /source -->

<!-- source connect.ts --pick "WalletConnectControllerOptions WalletConnectController connectWalletIfSessionExists connectWallet" -->
<!-- /source -->

## Usage

Connect

```js
import {
  connectWallet,
  connectWalletIfSessionExists, 
  WalletConnectController 
} from '@terra-money/terra-walletconnect'

// restore the session if the session is exists in the localStorage (e.g. browser reload...) 
const controller: WalletConnectController | null = connectWalletIfSessionExists()

if (!controller) {
  // connect with interaction
  document.querySelector('button').addEventListener('click', () => {
    const controller: WalletConnectController = connectWallet()
  })
}
```

Functions

```js
import {
  connectWallet,
  Session,
  WalletConnectController 
} from '@terra-money/terra-walletconnect'

const controller: WalletConnectController = connectWallet()

// watch session status
controller.session().subscribe((session: Session) => {
  // the session is one of SessionRequested | SessionConnected | SessionDisconnected
})

// get latest session status
controller.getLatestSession()

// transaction
const {txhash, height} = await controller.post(/* CreateTxOptions of terra.js */)

// disconnect session
controller.disconnect()
```