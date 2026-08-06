import crypto from 'crypto';

// Temporary in-memory store for pending OTP verifications
// Key: email (lowercase), Value: { otp, expiresAt, name, passwordHash }
const otpStore = new Map();

export const otpService = {
  generateOTP(email, name, passwordHash) {
    const cleanEmail = email.toLowerCase().trim();
    // Generate a 6-digit numeric OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    otpStore.set(cleanEmail, {
      otp,
      expiresAt,
      name,
      passwordHash
    });

    console.log(`=================================================`);
    console.log(`🔑 [OTP SERVICE] Verification Code Generated`);
    console.log(`👉 Email: ${cleanEmail}`);
    console.log(`👉 OTP Code: ${otp}`);
    console.log(`👉 Valid For: 10 minutes`);
    console.log(`=================================================`);

    return { otp, expiresAt };
  },

  verifyOTP(email, enteredOtp) {
    const cleanEmail = email.toLowerCase().trim();
    const record = otpStore.get(cleanEmail);

    if (!record) {
      return {
        success: false,
        error: 'No active OTP verification found for this email. Please request a new code.'
      };
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(cleanEmail);
      return {
        success: false,
        error: 'Verification code has expired. Please request a new code.'
      };
    }

    if (record.otp !== enteredOtp.toString().trim()) {
      return {
        success: false,
        error: 'Invalid 6-digit verification code. Please check and try again.'
      };
    }

    // OTP is valid - consume record and return user details
    const userData = {
      name: record.name,
      email: cleanEmail,
      passwordHash: record.passwordHash
    };

    otpStore.delete(cleanEmail);

    return {
      success: true,
      userData
    };
  },

  resendOTP(email) {
    const cleanEmail = email.toLowerCase().trim();
    const record = otpStore.get(cleanEmail);

    if (!record) {
      return {
        success: false,
        error: 'Registration session expired. Please start over.'
      };
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    otpStore.set(cleanEmail, {
      ...record,
      otp: newOtp,
      expiresAt
    });

    console.log(`[OTP SERVICE] Resent OTP Code ${newOtp} to ${cleanEmail}`);
    return { success: true, otp: newOtp, expiresAt };
  }
};
