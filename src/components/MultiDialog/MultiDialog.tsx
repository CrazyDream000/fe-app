import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  IconButton,
  Link,
  Skeleton,
} from "@mui/material";
import { timestampToReadableDate } from "../../utils/utils";
import { useDialog } from "../../hooks/useDialog";
import { closeDialog } from "../../redux/actions";
import { DialogContentElem } from "../../redux/reducers/ui";
import { WalletBox } from "../ConnectWallet/Content";
import { SlippageContent } from "../Slippage/SlippageContent";
import { Close } from "@mui/icons-material";
import { ClosePosition } from "../ClosePosition/ClosePosition";
import { WalletInfo } from "../WalletInfo/WalletInfo";
import { ReactNode } from "react";
import { BuyInsuranceModal } from "../Insurance/BuyInsuranceModal";
import { TransferDialog } from "../Transfer";
import { useAccount } from "../../hooks/useAccount";
import { ReactComponent as BraavosIcon } from "../Points/braavos_icon.svg";
import { ReactComponent as TwitterX } from "./twitterx.svg";
import braavosStyles from "./braavos.module.css";
import { useQuery } from "react-query";
import { QueryKeys } from "../../queries/keys";
import { fetchBraavosBonus } from "../Points/fetch";

const NetworkMismatch = () => (
  <>
    <DialogTitle id="alert-dialog-title">
      Wallet - dApp network mismatch
    </DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        Your wallet appears to be connected to a different network than this
        application. Please ensure that your wallet is connected to the same
        network as the app, or change the network that the app is using, in
        order to proceed.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <button onClick={closeDialog} autoFocus>
        Close
      </button>
    </DialogActions>
  </>
);

const MetamaskMissing = () => (
  <>
    <DialogTitle id="alert-dialog-title">Metamask wallet not found</DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        It appears that you do not have the Metamask wallet installed in your
        browser.
        <br />
        In order to stake using Wido, it is necessary to have the Metamask
        wallet.
        <br />
        To install it, please follow the instructions provided at{" "}
        <Link target="_blank" href="https://metamask.io/">
          metamask.io
        </Link>
        .
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <button onClick={closeDialog} autoFocus>
        Close
      </button>
    </DialogActions>
  </>
);

const getNextFridayMidnightUTC = (): string => {
  const today = new Date();
  const currentDay = today.getUTCDay();
  const daysUntilFriday = (5 - currentDay + 7) % 7; // Calculate days until next Friday
  const nextFriday = new Date(today);
  nextFriday.setUTCDate(today.getUTCDate() + daysUntilFriday);
  nextFriday.setUTCHours(0, 0, 0, 0); // Set to midnight UTC
  return timestampToReadableDate(nextFriday.getTime());
};

const NotEnoughUnlocked = () => (
  <>
    <DialogTitle id="alert-dialog-title">
      Not Enough Unlocked Capital
    </DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        Unfortunatelly, there is not enough unlocked capital in the AMM. Please
        try again after <strong>{getNextFridayMidnightUTC()}</strong>, when
        options expire and more capital will be unlocked.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <button onClick={closeDialog} autoFocus>
        Close
      </button>
    </DialogActions>
  </>
);

const BraavosBonusModal = () => {
  const account = useAccount();
  const { data, isLoading, isError } = useQuery(
    QueryKeys.braavosBonus,
    fetchBraavosBonus
  );

  if (!account) {
    return (
      <div className={braavosStyles.modal}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <BraavosIcon style={{ width: "30px", height: "30px" }} />
          <span style={{ fontSize: "25px" }}>Braavos Boost</span>
        </div>
        <div>
          <p style={{ fontSize: "17px", textAlign: "left", color: "#9daee5" }}>
            Connect your wallet to see which Braavos bonus you are eligible for!
          </p>
        </div>
      </div>
    );
  }

  if (isLoading || isError || !data) {
    return (
      <div className={braavosStyles.modal}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Skeleton variant="text" width="300px" height="50px" />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Skeleton variant="text" width="100%" height="100px" />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Skeleton variant="text" width="100%" height="80px" />
        </div>
      </div>
    );
  }

  const tweet = encodeURIComponent(
    "I just got a #BraavosBoost on @CarmineOptions 👀\n\nHere's a referral link you can use to amplify your points by up to 1.3x https://app.carmine.finance/?ref_code=braavos-referral-bonus\n\nMake sure you connect with @myBraavos to be eligible 💪"
  );
  const link = `https://x.com/intent/tweet?text=${tweet}`;

  const userData = data[account.address];

  const proScore = userData && userData.pro_score_80;
  const braavosReferral = userData && userData.braavos_referral;

  const bonusApplied = proScore || braavosReferral; // at least one of the bonuses

  return (
    <div className={braavosStyles.modal}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <BraavosIcon style={{ width: "30px", height: "30px" }} />
        <span style={{ fontSize: "25px" }}>
          Braavos Boost{bonusApplied && " applied!"}
        </span>
      </div>
      {braavosReferral ? (
        <div>
          <h5>✅ Referral Boost</h5>
          <p style={{ fontSize: "17px", textAlign: "left", color: "#9daee5" }}>
            You are eligible for a 1.2x Braavos boost. Your Carmine points will
            be multiplied by 1.2x.
          </p>
        </div>
      ) : (
        <div>
          <h5>❌ Referral Boost</h5>
          <p style={{ fontSize: "17px", textAlign: "left", color: "#9daee5" }}>
            You are not eligible for Braavos referral boost of 1.2x. Use Braavos
            referral code to activate the bonus.
          </p>
        </div>
      )}

      {proScore ? (
        <div>
          <h5>✅ Pro-score Boost</h5>
          <p style={{ fontSize: "17px", textAlign: "left", color: "#9daee5" }}>
            Your pro score is over 80, congratulations, you are eligible for
            1.1x boost!
          </p>
        </div>
      ) : (
        <div>
          <h5>❌ Pro-score Boost</h5>
          <p style={{ fontSize: "17px", textAlign: "left", color: "#9daee5" }}>
            Your wallet is not eligible for the Pro-score boost. Increase your
            Pro-score to 80 to get an additional 10% boost.
          </p>
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <a
          className={braavosStyles.tweet}
          href={link}
          target="_blank"
          rel="noopener nofollow noreferrer"
        >
          <TwitterX width="20px" />
          Share
        </a>
      </div>
    </div>
  );
};

type CustomDialogTitleProps = {
  title: string;
};

export const CustomDialogTitle = ({ title }: CustomDialogTitleProps) => (
  <DialogTitle
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      p: 2,
    }}
  >
    {title}
    <IconButton
      aria-label="close"
      onClick={closeDialog}
      sx={{
        color: (theme) => theme.palette.grey[500],
        minWidth: 0,
      }}
    >
      <Close />
    </IconButton>
  </DialogTitle>
);

type Props = {
  children: ReactNode;
};

const Border = ({ children }: Props) => {
  const style = {
    background: "black",
    border: "1px solid white",
    borderRadius: 0,
    overflow: "hidden",
  };

  return <div style={style}>{children}</div>;
};

export const MultiDialog = () => {
  const { dialogOpen, dialogContent } = useDialog();

  return (
    <Dialog
      open={dialogOpen}
      onClose={closeDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{ sx: { borderRadius: 0 } }}
    >
      {dialogContent === DialogContentElem.NetworkMismatch && (
        <Border>
          <NetworkMismatch />
        </Border>
      )}
      {dialogContent === DialogContentElem.Slippage && (
        <Border>
          <SlippageContent />
        </Border>
      )}
      {dialogContent === DialogContentElem.Wallet && (
        <Border>
          <WalletBox />
        </Border>
      )}
      {dialogContent === DialogContentElem.CloseOption && (
        <Border>
          <ClosePosition />
        </Border>
      )}
      {dialogContent === DialogContentElem.BuyInsurance && (
        <Border>
          <BuyInsuranceModal />
        </Border>
      )}
      {dialogContent === DialogContentElem.Account && (
        <Border>
          <WalletInfo />
        </Border>
      )}
      {dialogContent === DialogContentElem.MetamaskMissing && (
        <Border>
          <MetamaskMissing />
        </Border>
      )}
      {dialogContent === DialogContentElem.NotEnoughUnlocked && (
        <Border>
          <NotEnoughUnlocked />
        </Border>
      )}
      {dialogContent === DialogContentElem.TransferCapital && (
        <Border>
          <TransferDialog />
        </Border>
      )}
      {dialogContent === DialogContentElem.BraavosBonusModal && (
        <BraavosBonusModal />
      )}
    </Dialog>
  );
};
