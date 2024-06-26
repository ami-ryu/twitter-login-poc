// app/page.js
'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div>
      {!session && (
        <>
          <h1>Not signed in</h1>
          <div>
            <button
              style={{ width: '500px', height: '100px' }}
              onClick={() => signIn('twitter')}
            >
              Sign in with Twitter
            </button>
          </div>
          <br />
          <div>
            <button
              style={{ width: '500px', height: '100px' }}
              onClick={() => signIn('apple')}
            >
              Sign in with Apple
            </button>
          </div>
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
