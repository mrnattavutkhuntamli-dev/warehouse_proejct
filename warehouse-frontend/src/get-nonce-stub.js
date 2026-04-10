// src/get-nonce-stub.js
export const getNonce = () => {
  return typeof __webpack_nonce__ !== 'undefined' ? __webpack_nonce__ : undefined;
};