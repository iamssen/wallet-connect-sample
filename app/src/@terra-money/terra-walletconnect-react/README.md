# `@terra-money/terra-walletconnect-react`

React wrapper of `@terra-money/terra-walletconnect`

## Configuration

```jsx
import { WalletConnectProvider } from '@terra-money/terra-walletconnect-react'

function Main() {
  return (
    <WalletConnectProvider>
      <YOUR_APP />
    </WalletConnectProvider>
  )
}
```

## Usage

```jsx
import { useWalletConnect } from '@terra-money/terra-walletconnect-react'

function Component() {
  const {
    /** 
     * Start connect (Open WalletConnect QRCode)
     * 
     * If you have a session in the localStorage (keyname = walletconnect)
     * You don't need to call this function
     */
    connect, 
    
    /** Disconnect session */
    disconnect, 
    
    /**
     * The `session()` value of `@terra-money/terra-walletconnect`
     * 
     * This value is one of SessionRequested | SessionConnected | SessionDisconnected 
     */
    session, 
    
    /** 
     * Send Tx
     * 
     * (tx: CreateTxOptions) => Promise<{height: number, raw_log: string, txhash: string}>
     */
    post, 
  } = useWalletConnect()
  
  return <div>...</div>
}
```