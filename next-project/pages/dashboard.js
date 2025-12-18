import { useSession, signOut } from "next-auth/react";
import styles from "./home.module.css";

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    return <p className={styles.heading}>Access Denied. Please login.</p>;
  }

  return (
    <div>
      <h1  className={styles.heading}>Welcome to Dashboard, {session.user.name}</h1>
      <img src={session.user.image} alt="User Avatar" width={50} />
      <p>Email: {session.user.email}</p>
      <button onClick={() => signOut({ callbackUrl: "/" })}>Sign Out</button>
    </div>
  );
}
