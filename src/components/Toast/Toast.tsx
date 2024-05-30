import Snackbar from "@mui/material/Snackbar";
import { forwardRef, SyntheticEvent } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { hideToast } from "../../redux/actions";
import MuiAlert, { AlertColor, AlertProps } from "@mui/material/Alert";
import { ToastType } from "../../redux/reducers/ui";

import styles from "./toast.module.css";

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return (
    <div className={styles.wrapper}>
      <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
    </div>
  );
});

const toastTypeToSeverity = (t: ToastType): AlertColor => {
  switch (t) {
    case ToastType.Error:
      return "error";
    case ToastType.Success:
      return "success";
    case ToastType.Warn:
      return "warning";
    default:
      return "info";
  }
};

export const Toast = () => {
  const { message, open, type } = useSelector(
    (s: RootState) => s.ui.toastState
  );

  const handleClose = (event: SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }

    hideToast();
  };

  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
      <Alert
        onClose={handleClose}
        severity={toastTypeToSeverity(type)}
        sx={{ width: "100%", maxWidth: "400px" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};
