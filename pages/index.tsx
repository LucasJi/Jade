import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>{`Lucas Ji's Blog`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        Welcome to my blog!(WIP...) 
      </main>

      <footer className={styles.footer}>Copyright by Lucas Ji</footer>
    </div>
  );
}
