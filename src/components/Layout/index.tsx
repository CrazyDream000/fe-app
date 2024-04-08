import { Header } from "../Header/Header";
import { ReactNode } from "react";
import styles from "./layout.module.css";

type Props = {
  children: ReactNode;
};

export const Layout = ({ children }: Props) => (
  <>
    <Header />
    <div className={styles.container}>
      <main>{children}</main>
    </div>
  </>
);
