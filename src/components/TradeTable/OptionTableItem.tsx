import {
  CompositeOption,
  OptionType,
  ParsedCallOption,
  ParsedPutOption,
} from "../../types/options";
import { timestampToReadableDate, weiToEth } from "../../utils/utils";
import { TableCell, TableRow } from "@mui/material";
import BN from "bn.js";
import { USD_BASE_VALUE } from "../../constants/amm";

type OptionPreviewProps = {
  option: CompositeOption;
  handleClick: () => void;
};

const style = {
  cursor: "pointer",
  background: "white",
  "&:hover": {
    background: "#eee",
  },
};

const OptionTableItem = ({ option, handleClick }: OptionPreviewProps) => {
  const { strikePrice, maturity, optionType } = option.parsed;
  const msMaturity = maturity * 1000;

  const date = timestampToReadableDate(msMaturity);

  const currentPremia: BN =
    optionType === OptionType.Call
      ? new BN((option.parsed as ParsedCallOption).premiaWei)
      : new BN((option.parsed as ParsedPutOption).premiaUsd);

  const digits = 4;
  const displayPremia =
    optionType === OptionType.Call
      ? weiToEth(currentPremia, digits)
      : (
          currentPremia
            .mul(new BN(10 ** digits))
            .div(USD_BASE_VALUE)
            .toNumber() /
          10 ** digits
        ).toFixed(digits);
  const currency = optionType === OptionType.Call ? "ETH" : "USD";

  return (
    <TableRow sx={style} onClick={handleClick}>
      <TableCell>${strikePrice}</TableCell>
      <TableCell align="center">{date}</TableCell>
      <TableCell align="center">
        {currency} {displayPremia}
      </TableCell>
    </TableRow>
  );
};

export default OptionTableItem;
