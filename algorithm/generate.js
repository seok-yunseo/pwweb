const leetMap = { a: '@', s: '$', i: '1', o: '0', e: '3' };

function applyLeet(word, useLeet) {
  if (!useLeet) return word;
  return word
    .split('')
    .map((c) => leetMap[c] || c)
    .join('');
}

function isValid(pw) {
  return (
    pw.length >= 7 &&
    pw.length <= 10 &&
    /[a-z]/i.test(pw) &&
    /[0-9]/.test(pw) &&
    /[!@#$%^&*]/.test(pw)
  );
}

function generateFromUserInfo(info) {
  const baseWords = [];
  if (info.nickname) baseWords.push(info.nickname);
  if (info.petNames?.length) baseWords.push(...info.petNames);
  if (info.includeName) baseWords.push(info.firstName, info.lastName);

  const numberParts = [];
  if (info.birth) {
    const [y, m, d] = info.birth.split('-');
    numberParts.push(y, m + d, y.slice(2) + m + d);
  }
  if (info.phone?.length >= 4) numberParts.push(info.phone.slice(-4));
  if (info.homePhone?.length >= 4) numberParts.push(info.homePhone.slice(-4));
  numberParts.push(...(info.favNums || []));

  const specials = info.specialChars?.filter(Boolean) || ['!'];
  const useLeet = info.useLeet;

  const results = new Set();

  for (let word of baseWords) {
    const cleanWord = word?.toLowerCase()?.trim();
    if (!cleanWord) continue;
    for (let num of numberParts) {
      for (let s of specials) {
        const patterns = [
          cleanWord + num + s,
          s + cleanWord + num,
          cleanWord + s + num,
          num + cleanWord + s,
          applyLeet(cleanWord, useLeet) + num + s,
          applyLeet(cleanWord + num, useLeet) + s,
        ];
        for (let pw of patterns) {
          if (isValid(pw)) results.add(pw);
        }
      }
    }
  }

  return Array.from(results);
}

function generateFromCommonPasswords(commonList = []) {
  const results = new Set();
  for (let pw of commonList) {
    const clean = pw.toLowerCase().trim();
    if (isValid(clean)) results.add(clean);
  }
  return Array.from(results);
}

function randomPassword() {
  const abc = 'abcdefghijklmnopqrstuvwxyz';
  const nums = '0123456789';
  const special = '!@#$%^&*';
  const pool = abc + nums + special;

  while (true) {
    let pw = '';
    const len = 7 + Math.floor(Math.random() * 4); // 7~10자
    for (let i = 0; i < len; i++) {
      pw += pool[Math.floor(Math.random() * pool.length)];
    }
    if (isValid(pw)) return pw;
  }
}

export function generatePasswords(info, commonPasswords = []) {
  const finalSet = new Set();

  // 1️⃣ 사용자 기반
  const userPw = generateFromUserInfo(info);
  userPw.forEach((pw) => finalSet.add(pw));

  // 2️⃣ nord 일반 비번
  const nordPw = generateFromCommonPasswords(commonPasswords);
  nordPw.forEach((pw) => finalSet.add(pw));

  // 3️⃣ 랜덤 보충 (최대 1000개)
  let mixCount = 0;
  const maxMix = 1000;
  while (finalSet.size < 10000 && mixCount < maxMix) {
    const pw = randomPassword();
    if (!finalSet.has(pw)) {
      finalSet.add(pw);
      mixCount++;
    }
  }

  return Array.from(finalSet);
}
