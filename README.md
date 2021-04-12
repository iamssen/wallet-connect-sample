# Wallet Connect 샘플 App / Wallet

## Start Development

```sh
git clone ...
cd <your_project_path>
yarn install
cd app
yarn run start
```

- (Create-React-App 의 react-scripts 와 비슷한) 개발 서버가 Terminal 2개로 열린다 
- iTerm 이 설치되어 있으면 좋다 (Terminal 2개가 아니라, 분할 화면으로 열림)
- Terminal 들에 접속 가능한 URL 이 보이게 됨 (localhost:8000, localhost:8001 포트가 비어있으면 해당 포트로 열려있을 것임)
    - Terminal 상에서 단축키 `b`를 눌러서 브라우저를 열어도 되고, 수동으로 브라우저에서 해당 주소를 열어도 됨

## Directories

- `app/src/app` dApp 샘플
    - QR Code 로 Wallet Connect Session 시작
    - Session 연결 이후, 간단하게 Anchor Deposit $10 를 보낼 수 있는 Tx 샘플
- `app/src/wallet` Wallet 샘플
    - dApp 에서 QR Code 가 열리면 아래 URI Code를 Clipboard 로 복사할 수 있는데, 해당 URI Code를 사용해서 Session 시작
    - dApp의 Session 접속 허용 / 거부
    - Session 연결 이후, dApp 에서 Request 요청이 오면 허용 / 거부

## 테스트 상 특이점

- 양쪽을 모두 Webpack HMR Server 로 띄우고 있어서 그런지 연결이 불안정함 (dApp 의 Request 요청을 받지 못하는 경우가 자주 발생됨)
    - Tx 요청이 잘 들어가지 않는다면 양쪽 웹브라우저를 모두 새로고침 한 다음에 시도하면 됨
- `WalletConnect.sendTransaction()` 은 이더리움 전용으로 보임 (이더리움 Tx Validation을 하고 있어서 Custom Tx 는 실패함)
    - `WalletConnect.sendCustomRequest()` 로 처리 (dApp 쪽의 문제이고, Wallet 에서는 동일한 Event 로 처리되는 것으로 보임)