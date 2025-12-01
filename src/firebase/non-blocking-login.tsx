
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  UserCredential,
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string, displayName: string): Promise<UserCredential> {
  const promise = createUserWithEmailAndPassword(authInstance, email, password);
  promise.then(userCredential => {
    if (userCredential.user) {
      updateUserProfile(userCredential.user, { displayName });
    }
  });
  return promise;
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(authInstance, email, password);
}

/** Updates a user's profile information (non-blocking). */
export function updateUserProfile(user: any, profile: { displayName?: string; photoURL?: string }): void {
  updateProfile(user, profile);
}
