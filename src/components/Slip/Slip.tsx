import { useEffect, useState } from "react";
import styles from "./Slip.module.css";

const MIN_WIDTH = 1200;

const SlipElem = () => (
  <div className={styles.slip}>
    This App uses new Carmine Protocol with C2 contracts. Old App can be
    accessed at{" "}
    <a href="https://legacy.app.carmine.finance">legacy.app.carmine.finance</a>.
  </div>
);

export const Slip = () => {
  const [isWideScreen, setIsWideScreen] = useState(window.innerWidth > MIN_WIDTH);

  useEffect(() => {
    function handleResize() {
      setIsWideScreen(window.innerWidth > MIN_WIDTH);
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (isWideScreen) {
    return <SlipElem />;
  }

  return (
    <div className={styles["scroll-container"]}>
      <div className={styles.scroller}>
        <SlipElem />
        <SlipElem />
      </div>
    </div>
  );
};
