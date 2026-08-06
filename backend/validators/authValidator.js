import { z } from 'zod';

const DISPOSABLE_OR_FAKE_DOMAINS = [
  'test.com', 'example.com', 'asdf.com', 'fake.com', 'temp.com', 
  'random.com', 'mailinator.com', 'guerrillamail.com', '10minutemail.com', 
  'trashmail.com', 'dispostable.com', 'yopmail.com', 'sharklasers.com', 
  'getairmail.com', 'tempmail.com', 'throwaway.com', 'dummy.com', 'qwerty.com'
];

const DOMAIN_TYPOS = {
  'gmaill.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'outlok.com': 'outlook.com',
  'hotmial.com': 'hotmail.com'
};

export const realEmailSchema = z.string()
  .trim()
  .toLowerCase()
  .email('Invalid email address format')
  .refine((val) => {
    const parts = val.split('@');
    if (parts.length !== 2) return false;
    const [username, domain] = parts;
    if (username.length < 3) return false;
    if (DOMAIN_TYPOS[domain]) return false;
    if (DISPOSABLE_OR_FAKE_DOMAINS.includes(domain)) return false;
    if (domain.startsWith('test') || domain.startsWith('fake') || domain.startsWith('random') || domain.startsWith('temp')) return false;
    const domainParts = domain.split('.');
    if (domainParts.length < 2 || domainParts[domainParts.length - 1].length < 2) return false;
    return true;
  }, {
    message: 'Please provide a valid, real email address. Disposable, typo, or fake test emails (like @gmaill.com, @test.com, or @random.com) are not allowed.'
  });

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: realEmailSchema,
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const loginSchema = z.object({
  email: realEmailSchema,
  password: z.string().min(1, 'Password is required'),
});
