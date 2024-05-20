import { Token, TokenKey } from "../../classes/Token";
import styles from "./widget.module.css";

export type SelectableToken = {
  icon: string;
  name: string;
  address: string;
};

type Props = {
  setSelection: (t: Token) => void;
  close: () => void;
};

export const TokenDisplay = ({ token }: { token: Token }) => {
  return (
    <div className={styles.tokendisplay}>
      <img
        width="40px"
        height="40px"
        src={token.icon}
        alt={`${token.symbol} logo`}
      />
      {token.symbol}
    </div>
  );
};

export const TokenSelect = ({ close, setSelection }: Props) => {
  const tokenKeys = [TokenKey.ETH, TokenKey.STRK, TokenKey.USDC, TokenKey.BTC];
  return (
    <div className={styles.modalcontainer}>
      <h3>Select a token</h3>
      {tokenKeys.map((tokenKey) => {
        const token = Token.byKey(tokenKey);
        return (
          <div
            className={styles.row}
            onClick={() => {
              setSelection(token);
              close();
            }}
          >
            <TokenDisplay token={token} />
          </div>
        );
      })}
    </div>
  );
};
