import { useSession, signIn } from "next-auth/react";
import styles from "./home.module.css";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className={styles.container}>
      {!session ? (
        <>
          <h2 className={styles.heading}>Please Sign In</h2>
          <button className={styles.button} onClick={() => signIn("github", { callbackUrl: "/dashboard" })}>
            Sign In with GitHub
          </button>
        </>
      ) : (
        <h2 className={styles.heading}>Hello... {session.user.name}</h2>
      )}
    </div>
  );
}
