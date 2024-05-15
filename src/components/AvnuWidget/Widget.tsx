import { ChangeEvent, useState } from "react";
import { executeSwap, fetchQuotes, Quote } from "@avnu/avnu-sdk";
import { formatUnits, parseUnits } from "ethers";
import { useAccount } from "../../hooks/useAccount";
import { openWalletConnectDialog } from "../ConnectWallet/Button";

import styles from "./widget.module.css";

const AVNU_OPTIONS = { baseUrl: "https://starknet.api.avnu.fi" };
const ethAddress =
  "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
const usdcAddress =
  "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";

export const Widget = () => {
  const account = useAccount();
  const [sellAmount, setSellAmount] = useState<string>();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();

  const handleChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
    if (!account) return;
    setErrorMessage("");
    setQuotes([]);
    setSellAmount(event.target.value);
    setLoading(true);
    const params = {
      sellTokenAddress: ethAddress,
      buyTokenAddress: usdcAddress,
      sellAmount: parseUnits(event.target.value, 18),
      takerAddress: account.address,
      size: 1,
    };
    fetchQuotes(params, AVNU_OPTIONS)
      .then((quotes) => {
        setLoading(false);
        setQuotes(quotes);
      })
      .catch(() => setLoading(false));
  };

  const handleSwap = async () => {
    if (!account || !sellAmount || !quotes || !quotes[0]) return;
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);
    executeSwap(account, quotes[0], {}, AVNU_OPTIONS)
      .then(() => {
        setSuccessMessage("success");
        setLoading(false);
        setQuotes([]);
      })
      .catch((error: Error) => {
        setLoading(false);
        setErrorMessage(error.message);
      });
  };

  if (!account) {
    return <button onClick={openWalletConnectDialog}>Connect Wallet</button>;
  }

  return (
    <div className={styles.container}>
      <div>
        <h3>Sell Token</h3>
        <h4>ETH</h4>
        <input
          style={{ background: "black" }}
          onChange={handleChangeInput}
          disabled={loading}
        />
      </div>
      <div>&darr;</div>
      <div>
        <h3>Buy Token</h3>
        <h4>USDC</h4>
        <input
          style={{ background: "black" }}
          readOnly
          type="text"
          id="buy-amount"
          value={quotes && quotes[0] ? formatUnits(quotes[0].buyAmount, 6) : ""}
        />
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        quotes && quotes[0] && <button onClick={handleSwap}>Swap</button>
      )}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: "green" }}>Success</p>}
    </div>
  );
};
