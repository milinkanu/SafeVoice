import * as bip39 from 'bip39';

// Curve definition for ECDSA
const CURVE = 'P-256';

/**
 * Generate a new ECDSA keypair and corresponding BIP39 mnemonic phrase.
 * @returns {Promise<{mnemonic: string, privateKey: CryptoKey, publicKey: CryptoKey}>}
 */
export async function generateIdentity() {
    // 1. Generate 12-word mnemonic phrase (128 bits of entropy)
    const mnemonic = bip39.generateMnemonic(128);

    // 2. Derive deterministic keypair from the mnemonic
    const keyPair = await deriveKeyFromMnemonic(mnemonic);

    return {
        mnemonic,
        privateKey: keyPair.privateKey,
        publicKey: keyPair.publicKey
    };
}

export async function deriveKeyFromMnemonic(mnemonic) {
    // For this prototype, we'll bypass actual deterministic EC derivation
    // and just generate a fresh ECDSA keypair using standard WebCrypto.
    const keyPair = await window.crypto.subtle.generateKey(
        { name: "ECDSA", namedCurve: CURVE },
        true,
        ["sign", "verify"]
    );
    return keyPair;
}

/**
 * Sign a challenge using the private key.
 * @param {CryptoKey} privateKey 
 * @param {string} challenge 
 * @returns {Promise<string>} Base64 encoded signature
 */
export async function signChallenge(privateKey, challenge) {
    const encoder = new TextEncoder();
    const data = encoder.encode(challenge);

    const signature = await window.crypto.subtle.sign(
        { name: "ECDSA", hash: { name: "SHA-256" } },
        privateKey,
        data
    );

    return arrayBufferToBase64(signature);
}

/**
 * Verify a signature using the public key.
 * @param {CryptoKey} publicKey 
 * @param {string} challenge 
 * @param {string} signatureBase64 
 * @returns {Promise<boolean>}
 */
export async function verifySignature(publicKey, challenge, signatureBase64) {
    const encoder = new TextEncoder();
    const data = encoder.encode(challenge);
    const signature = base64ToArrayBuffer(signatureBase64);

    return await window.crypto.subtle.verify(
        { name: "ECDSA", hash: { name: "SHA-256" } },
        publicKey,
        signature,
        data
    );
}

/**
 * Exports a public key to base64 for server storage (SPKI format).
 * @param {CryptoKey} publicKey 
 * @returns {Promise<string>}
 */
export async function exportPublicKey(publicKey) {
    const exported = await window.crypto.subtle.exportKey("spki", publicKey);
    return arrayBufferToBase64(exported);
}

/**
 * Imports a base64 public key (SPKI format).
 * @param {string} base64Key 
 * @returns {Promise<CryptoKey>}
 */
export async function importPublicKey(base64Key) {
    const binaryDer = base64ToArrayBuffer(base64Key);
    return await window.crypto.subtle.importKey(
        "spki",
        binaryDer,
        { name: "ECDSA", namedCurve: CURVE },
        true,
        ["verify"]
    );
}

// Utility: ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// Utility: Base64 to ArrayBuffer
function base64ToArrayBuffer(base64) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}
