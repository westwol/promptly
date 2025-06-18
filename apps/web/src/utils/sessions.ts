'use server';

import { cookies } from 'next/headers';

const SESSION_COOKIE_IDENTIFIER = 'anonymous_session_id';

export const setSessionCookie = async (key: string) => {
  const _cookies = await cookies();
  _cookies.set({
    name: SESSION_COOKIE_IDENTIFIER,
    value: key,
    httpOnly: true,
  });
};

export const getSessionCookie = async () => {
  const cookieStore = await cookies();
  const sessionKey = cookieStore.get(SESSION_COOKIE_IDENTIFIER);
  return sessionKey?.value || '';
};
