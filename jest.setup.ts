// `features/common/config/env.ts` fails fast at import time without an API URL. Tests
// never hit the network, but any module importing the HTTP client needs one defined.
process.env.EXPO_PUBLIC_API_URL ??= "https://api.test";
