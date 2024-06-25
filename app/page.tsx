// app/page.js
'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import Provider from './session-provider';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div>
      {!session && (
        <>
          <h1>Not signed in</h1>
          <button onClick={() => signIn('twitter')}>
            Sign in with Twitter
          </button>
        </>
      )}
      {session && (
        <>
          <h1>Signed in as {session.user.name}</h1>
          <img src={session.user.image} alt={session.user.name} />
          <p>Email: {session.user.email}</p>
          <button onClick={() => signOut()}>Sign out</button>
        </>
      )}
    </div>
  );
}
