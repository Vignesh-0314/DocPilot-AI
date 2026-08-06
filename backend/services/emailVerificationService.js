import crypto from 'crypto';

// Temporary in-memory store for pending email verification tokens
// Key: email (lowercase), Value: { token, expiresAt, name, passwordHash }
const verificationStore = new Map();

export const emailVerificationService = {
  createVerificationToken(email, name, passwordHash, originUrl = 'http://localhost:3000') {
    const cleanEmail = email.toLowerCase().trim();
    // Generate a secure 32-byte hex token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes expiry

    verificationStore.set(cleanEmail, {
      token,
      expiresAt,
      name,
      passwordHash
    });

    const verificationUrl = `${originUrl}/verify-email?token=${token}&email=${encodeURIComponent(cleanEmail)}`;

    console.log(`=================================================`);
    console.log(`🔗 [EMAIL VERIFICATION] Magic Link Generated`);
    console.log(`👉 Email: ${cleanEmail}`);
    console.log(`👉 Link: ${verificationUrl}`);
    console.log(`👉 Valid For: 15 minutes`);
    console.log(`=================================================`);

    return { token, verificationUrl, expiresAt };
  },

  confirmVerificationToken(email, token) {
    const cleanEmail = email.toLowerCase().trim();
    const record = verificationStore.get(cleanEmail);

    if (!record) {
      return {
        success: false,
        error: 'Invalid or expired email verification link. Please request a new verification link.'
      };
    }

    if (Date.now() > record.expiresAt) {
      verificationStore.delete(cleanEmail);
      return {
        success: false,
        error: 'Verification link has expired. Please request a new link.'
      };
    }

    if (record.token !== token.trim()) {
      return {
        success: false,
        error: 'Verification token mismatch or corrupted link.'
      };
    }

    // Token is valid - consume record and return user details for account creation
    const userData = {
      name: record.name,
      email: cleanEmail,
      passwordHash: record.passwordHash
    };

    verificationStore.delete(cleanEmail);

    return {
      success: true,
      userData
    };
  },

  resendVerificationLink(email, originUrl = 'http://localhost:3000') {
    const cleanEmail = email.toLowerCase().trim();
    const record = verificationStore.get(cleanEmail);

    if (!record) {
      return {
        success: false,
        error: 'No pending registration found for this email. Please register again.'
      };
    }

    const newToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000;

    verificationStore.set(cleanEmail, {
      ...record,
      token: newToken,
      expiresAt
    });

    const verificationUrl = `${originUrl}/verify-email?token=${newToken}&email=${encodeURIComponent(cleanEmail)}`;

    console.log(`[EMAIL VERIFICATION] Resent Magic Link to ${cleanEmail}: ${verificationUrl}`);

    return {
      success: true,
      verificationUrl,
      expiresAt
    };
  }
};
