import { createContext, useContext } from 'react';

export const AuthPromptContext = createContext(null);

export function useAuthPrompt() {
  return useContext(AuthPromptContext);
}
