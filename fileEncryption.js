/**
 * File encryption and decryption using Web Crypto API
 * Uses AES-GCM for secure encryption
 */

// Generate a random 256-bit key for AES-GCM
async function generateKey() {
    return await window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256
        },
        true, // extractable
        ["encrypt", "decrypt"]
    );
}

// Convert string to ArrayBuffer
function stringToArrayBuffer(str) {
    return new TextEncoder().encode(str).buffer;
}

// Convert ArrayBuffer to string
function arrayBufferToString(buffer) {
    return new TextDecoder().decode(buffer);
}

// Convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// Convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

// Encrypt file content
async function encryptFile(fileContent, key) {
    try {
        // Generate a random IV (Initialization Vector)
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        
        // Convert file content to ArrayBuffer if it's a string
        const data = typeof fileContent === 'string' 
            ? stringToArrayBuffer(fileContent) 
            : fileContent;

        // Encrypt the data
        const encrypted = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            data
        );

        // Combine IV and encrypted data
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encrypted), iv.length);

        // Return Base64 encoded result
        return {
            encryptedData: arrayBufferToBase64(combined),
            iv: arrayBufferToBase64(iv)
        };
    } catch (error) {
        console.error('Encryption error:', error);
        throw error;
    }
}

// Decrypt file content
async function decryptFile(encryptedData, key, iv) {
    try {
        // Convert Base64 encoded data back to ArrayBuffer
        const encryptedBuffer = base64ToArrayBuffer(encryptedData);
        const ivBuffer = base64ToArrayBuffer(iv);

        // Decrypt the data
        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: ivBuffer
            },
            key,
            encryptedBuffer.slice(ivBuffer.byteLength)
        );

        // Convert decrypted ArrayBuffer to string
        return arrayBufferToString(decrypted);
    } catch (error) {
        console.error('Decryption error:', error);
        throw error;
    }
}

// Example usage
async function example() {
    try {
        // Generate a key
        const key = await generateKey();

        // Example file content (e.g., decompiled APK asset)
        const fileContent = "This is a sample APK asset content";

        // Encrypt the file content
        const { encryptedData, iv } = await encryptFile(fileContent, key);
        console.log('Encrypted data (Base64):', encryptedData);

        // Decrypt the file content
        const decryptedContent = await decryptFile(encryptedData, key, iv);
        console.log('Decrypted content:', decryptedContent);
    } catch (error) {
        console.error('Example error:', error);
    }
}

// Export functions for use in other scripts
export { generateKey, encryptFile, decryptFile };
