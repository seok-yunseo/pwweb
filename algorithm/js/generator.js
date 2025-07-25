const leetMap = { a: '@', s: '$', i: '1', o: '0', e: '3' };

export function applyLeet(word, useLeet) {
  if (!useLeet) return word;
  return word.split('').map(c => leetMap[c] || c).join('');
}

export function generatePasswords(info) {
  const baseWords = [info.nickname, ...(info.petNames || [])];
  if (info.includeName) {
    baseWords.push(info.firstName, info.lastName);
  }

  const numberParts = [];
  if (info.birth) {
    const [y, m, d] = info.birth.split("-");
    numberParts.push(y, m + d);
  }
  if (info.phone?.length >= 4) numberParts.push(info.phone.slice(-4));
  if (info.homePhone?.length >= 4) numberParts.push(info.homePhone.slice(-4));
  numberParts.push(...(info.favNums || []));

  const specials = info.specialChars?.filter(Boolean) || ['!'];
  const useLeet = info.useLeet;

  const passwords = new Set();

  outer: for (let word of baseWords) {
    for (let num of numberParts) {
      for (let s of specials) {
        const combos = [
          word + num + s,
          s + word + num,
          word + s + num,
          num + word + s,
          applyLeet(word, useLeet) + num + s,
          applyLeet(word + num, useLeet) + s
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

  while (passwords.size < 10000) {
    passwords.add(randomPassword());
  }

  return Array.from(passwords);
}

function randomPassword() {
  const abc = "abcdefghijklmnopqrstuvwxyz";
  const extra = "!@#$%^&*";
  let pw = "";
  const len = 7 + Math.floor(Math.random() * 4);
  for (let i = 0; i < len - 1; i++) {
    pw += abc[Math.floor(Math.random() * abc.length)];
  }
  pw += extra[Math.floor(Math.random() * extra.length)];
  return pw;
}
