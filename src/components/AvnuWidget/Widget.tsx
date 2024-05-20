import { useEffect, useRef, useState } from "react";
import { executeSwap, fetchQuotes, Quote } from "@avnu/avnu-sdk";
import { formatUnits, parseUnits } from "ethers";
import { useAccount } from "../../hooks/useAccount";
import { openWalletConnectDialog } from "../ConnectWallet/Button";

import styles from "./widget.module.css";
import inputStyles from "../../style/input.module.css";
import { TokenDisplay, TokenSelect } from "./TokenSelect";
import { EthToken, Token, UsdcToken } from "../../classes/Token";

const AVNU_BASE_URL = "https://starknet.api.avnu.fi";

const AVNU_OPTIONS = { baseUrl: AVNU_BASE_URL };

const DownAngled = () => (
  <div style={{ transform: "rotate(90deg)", paddingLeft: "12px" }}>&rang;</div>
);

export const Widget = () => {
  const account = useAccount();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState(inputValue);
  const [sellAmount, setSellAmount] = useState<string>();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [tokenSelectOpen, setTokenSelectOpen] = useState<
    undefined | "buy" | "sell"
  >(undefined);
  const [sellToken, setSellToken] = useState<Token>(EthToken);
  const [buyToken, setBuyToken] = useState<Token>(UsdcToken);

  const handleInputChange = (value: string) => {
    // Allow empty string, valid number, or a single decimal point followed by numbers
    const numericValue =
      value === "" || /^\d*\.?\d*$/.test(value) ? value : inputValue;
    setInputValue(numericValue);
  };

  const handleArrowClick = () => {
    const sellTokenCopy = sellToken;
    setSellToken(buyToken);
    setBuyToken(sellTokenCopy);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue]);

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const fetchData = async () => {
      if (!account || buyToken.id === sellToken.id) {
        setQuotes([]);
        return;
      }

      const num = parseFloat(debouncedValue);

      if (num === 0 || isNaN(num)) {
        return;
      }

      abortControllerRef.current = new AbortController();
      const abortSignal = abortControllerRef.current.signal;

      setErrorMessage("");
      setQuotes([]);
      setSellAmount(debouncedValue);
      setLoading(true);
      const params = {
        sellTokenAddress: sellToken.address,
        buyTokenAddress: buyToken.address,
        sellAmount: parseUnits(debouncedValue, sellToken.decimals),
        takerAddress: account.address,
        size: 1,
      };
      fetchQuotes(params, { baseUrl: AVNU_BASE_URL, abortSignal })
        .then((quotes) => {
          setLoading(false);
          console.log(quotes);
          setQuotes(quotes);
        })
        .catch(() => setLoading(false));
    };

    if (debouncedValue) {
      fetchData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedValue, sellToken, buyToken]);

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
      {tokenSelectOpen !== undefined && (
        <TokenSelect
          close={() => setTokenSelectOpen(undefined)}
          setSelection={tokenSelectOpen === "sell" ? setSellToken : setBuyToken}
        />
      )}
      <div className={styles.tokeninput}>
        <div
          style={{ display: "flex", flexFlow: "column", alignItems: "center" }}
        >
          <input
            className={inputStyles.input}
            placeholder="0"
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
          />
          <span>
            {quotes && quotes[0] && `$${quotes[0].buyAmountInUsd.toFixed(2)}`}
          </span>
        </div>

        <div
          style={{ display: "flex" }}
          className={styles.row}
          onClick={() => setTokenSelectOpen("sell")}
        >
          <TokenDisplay token={sellToken} />
          <DownAngled />
        </div>
      </div>
      <div
        style={{ cursor: "pointer", textAlign: "center", padding: "20px" }}
        onClick={handleArrowClick}
      >
        &darr;
      </div>
      <div>
        <div className={styles.tokeninput}>
          <div
            style={{
              display: "flex",
              flexFlow: "column",
              alignItems: "center",
            }}
          >
            <input
              className={inputStyles.input}
              placeholder="0"
              readOnly
              type="text"
              id="buy-amount"
              value={
                quotes && quotes[0]
                  ? formatUnits(quotes[0].buyAmount, buyToken.decimals)
                  : ""
              }
            />
            <span>
              {quotes && quotes[0] && `$${quotes[0].buyAmountInUsd.toFixed(2)}`}
            </span>
          </div>
          <div
            style={{ display: "flex" }}
            className={styles.row}
            onClick={() => setTokenSelectOpen("buy")}
          >
            <TokenDisplay token={buyToken} />
            <DownAngled />
          </div>
        </div>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        quotes &&
        quotes[0] && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <button onClick={handleSwap}>Swap</button>
          </div>
        )
      )}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: "green" }}>Success</p>}
    </div>
  );
};
