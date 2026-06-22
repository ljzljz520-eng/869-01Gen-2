export function anonymizeName(name: string, isAnonymous: boolean = false): string {
  if (isAnonymous || !name) {
    return '爱心人士';
  }

  if (name.length <= 1) {
    return '*';
  }

  if (name.length === 2) {
    return `${name[0]}*`;
  }

  if (name.length === 3) {
    return `${name[0]}*${name[2]}`;
  }

  const firstChar = name[0];
  const lastChar = name[name.length - 1];
  const stars = '*'.repeat(name.length - 2);
  return `${firstChar}${stars}${lastChar}`;
}

export function anonymizePhone(phone: string): string {
  if (!phone || phone.length < 7) {
    return '***';
  }
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

export function anonymizeEmail(email: string): string {
  if (!email || !email.includes('@')) {
    return '***';
  }
  const [username, domain] = email.split('@');
  if (username.length <= 2) {
    return `***@${domain}`;
  }
  const maskedUsername = `${username[0]}${'*'.repeat(username.length - 2)}${username[username.length - 1]}`;
  return `${maskedUsername}@${domain}`;
}

export function anonymizeIdCard(idCard: string): string {
  if (!idCard || idCard.length < 10) {
    return '**********';
  }
  return `${idCard.slice(0, 4)}**********${idCard.slice(-4)}`;
}

export function anonymizeAddress(address: string): string {
  if (!address) {
    return '***';
  }
  if (address.length <= 6) {
    return `${address.slice(0, 2)}***`;
  }
  return `${address.slice(0, 6)}***`;
}

export function anonymizeBankAccount(account: string): string {
  if (!account || account.length < 8) {
    return '********';
  }
  return `${account.slice(0, 4)}${'*'.repeat(account.length - 8)}${account.slice(-4)}`;
}

export function generateAnonymousDonorName(index?: number): string {
  if (typeof index === 'number') {
    return `爱心人士${String(index + 1).padStart(3, '0')}`;
  }
  const adjectives = ['热心', '善良', '温暖', '慷慨', '有爱的', '默默奉献的', '心怀大爱的', '充满善意的'];
  const nouns = ['朋友', '先生', '女士', '同学', '老师', '同事', '家人'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}${noun}`;
}
