const leetMap = { a: '@', s: '$', i: '1', o: '0', e: '3' };

function applyLeet(word, useLeet) {
  if (!useLeet) return word;
  return word.split('').map(c => leetMap[c] || c).join('');
}

function randomPassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const specials = '!@#$%^&*';
  let pw = '';
  const len = 7 + Math.floor(Math.random() * 4); // 7~10자리

  for (let i = 0; i < len - 1; i++) {
    pw += chars[Math.floor(Math.random() * chars.length)];
  }
  pw += specials[Math.floor(Math.random() * specials.length)];
  return pw;
}

export function generatePasswords(info) {
  const {
    firstName = '',
    lastName = '',
    birth = '',
    phone = '',
    homePhone = '',
    nickname = '',
    petNames = [],
    favNums = [],
    specialChars = [],
    includeName = false,
    useLeet = false
  } = info;

  const specials = specialChars.filter(c => /[!@#$%^&*]/.test(c));
  if (specials.length === 0) specials.push('!'); // fallback

  const baseWords = [nickname, ...(petNames || [])];
  if (includeName) {
    baseWords.push(firstName, lastName);
  }

  const numberParts = [];
  if (birth) {
    const [y, m, d] = birth.split('-');
    numberParts.push(y, m + d);
  }
  if (phone?.length >= 4) numberParts.push(phone.slice(-4));
  if (homePhone?.length >= 4) numberParts.push(homePhone.slice(-4));
  numberParts.push(...(favNums || []));

  const passwords = new Set();

  outer: for (let word of baseWords) {
    word = word.toLowerCase();
    for (let num of numberParts) {
      for (let sym of specials) {
        const combos = [
          word + num + sym,
          sym + word + num,
          word + sym + num,
          num + word + sym,
          applyLeet(word, useLeet) + num + sym,
          applyLeet(word + num, useLeet) + sym
        ];
        for (let pw of combos) {
          if (pw.length >= 7 && pw.length <= 10 && /[!@#$%^&*]/.test(pw)) {
            passwords.add(pw);
            if (passwords.size >= 10000) break outer;
          }
        }
      }
    }
  }

  // 부족하면 랜덤으로 채움
  while (passwords.size < 10000) {
    passwords.add(randomPassword());
  }

  return Array.from(passwords);
}
