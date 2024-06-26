import NextAuth from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';
import AppleProvider from 'next-auth/providers/apple';
import CredentialsProvider from 'next-auth/providers/credentials';
import { SignJWT } from 'jose';
import { createPrivateKey } from 'crypto';

const getAppleToken = async () => {
  const key = `-----BEGIN PRIVATE KEY-----\n${process.env.APPLE_PRIVATE_KEY}\n-----END PRIVATE KEY-----\n`;

  const appleToken = await new SignJWT({})
    .setAudience('https://appleid.apple.com')
    .setIssuer(process.env.APPLE_TEAM_ID)
    .setIssuedAt(new Date().getTime() / 1000)
    .setExpirationTime(new Date().getTime() / 1000 + 3600 * 2)
    .setSubject(process.env.APPLE_ID)
    .setProtectedHeader({
      alg: 'ES256',
      kid: process.env.APPLE_KEY_ID,
    })
    .sign(createPrivateKey(key));
  return appleToken;
};

const handler = async (req, res) => {
  console.log('------------req------------', req);
  console.log('------------res------------', res);
  // 애플 최초 가입일 경우 req.body에 user.name이 담겨옴
  let appleFirstInfo;
  if (
    req?.url?.includes('callback/apple') &&
    req?.method === 'POST' &&
    req.body.user
  ) {
    appleFirstInfo = await JSON.parse(req.body.user);
  }

  return NextAuth(req, res, {
    cookies: {
      callbackUrl: {
        name: `__Secure-next-auth.callback-url`,
        options: {
          httpOnly: false,
          sameSite: 'none',
          path: '/',
          secure: true,
        },
      },
    },
    providers: [
      CredentialsProvider({
        // The name to display on the sign in form (e.g. "Sign in with...")
        name: 'Credentials',
        // `credentials` is used to generate a form on the sign in page.
        // You can specify which fields should be submitted, by adding keys to the `credentials` object.
        // e.g. domain, username, password, 2FA token, etc.
        // You can pass any HTML attribute to the <input> tag through the object.
        credentials: {
          username: {
            label: '이메일',
            type: 'text',
            placeholder: '이메일 주소 입력 요망',
          },
          password: { label: '비밀번호', type: 'password' },
        },
        async authorize(credentials, req) {
          // Add logic here to look up the user from the credentials supplied
          const user = {
            id: '1',
            name: 'J Smith',
            email: 'jsmith@example.com',
          };

          if (user) {
            // Any object returned will be saved in `user` property of the JWT
            return user;
          } else {
            // If you return null then an error will be displayed advising the user to check their details.
            return null;

            // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
          }
        },
      }),
      TwitterProvider({
        clientId: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
        version: '2.0',
      }),
      AppleProvider({
        clientId: process.env.APPLE_ID,
        clientSecret: await getAppleToken(),
      }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      async jwt(data) {
        if (data.account) {
          data.token.accessToken = data.account.access_token;
          data.token.provider = data.account.provider;
        }
        return data.token;
      },
      async session({ session, token }) {
        if (session) {
          session.accessToken = token.accessToken;
          session.provider = token.provider;
          session.user.id = token.sub;
        }
        return session;
      },
      async signIn({ user, account, profile, email, credentials }) {
        const isAllowedToSignIn = true;
        if (isAllowedToSignIn) {
          console.log(user, account, profile, email, credentials);
          return true;
        } else {
          // Return false to display a default error message
          return false;
          // Or you can return a URL to redirect to:
          // return '/unauthorized'
        }
      },
      async redirect({ url, baseUrl }) {
        console.log(url, baseUrl);
        // Allows relative callback URLs
        if (url.startsWith('/')) return `${baseUrl}${url}`;
        // Allows callback URLs on the same origin
        else if (new URL(url).origin === baseUrl) return url;
        return baseUrl;
      },
    },
  });
};

export { handler as GET, handler as POST };
