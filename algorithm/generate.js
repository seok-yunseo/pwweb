const leetMap = { a: '@', s: '$', i: '1', o: '0', e: '3' };

function isValid(pw) {
  const specials = pw.match(/[!@#$]/g) || [];
  return (
    pw.length >= 7 &&
    pw.length <= 10 &&
    /[a-z]/i.test(pw) &&
    /[0-9]/.test(pw) &&
    specials.length === 1
  );
}

function generateFromUserInfo(info) {
  const baseWords = [];

  // 이름, 성, 닉네임, 펫네임
  if (info.options.useNick && info.nickname) baseWords.push(info.nickname);
  if (info.options.usePet && info.petNames?.length) baseWords.push(...info.petNames);
  if (info.options.useName) {
    if (info.firstName) baseWords.push(info.firstName);
    if (info.lastName) baseWords.push(info.lastName);
  }

  // 이니셜 패턴 추가
  if (info.options.useInitial && info.firstName && info.lastName) {
    const first = info.firstName.toLowerCase();
    const last = info.lastName.toLowerCase();

    // 요구된 이니셜 조합
    baseWords.push(last[0] + first[0]);        // ys
    baseWords.push(last[0] + first[0] + 's');  // sys
    baseWords.push(last[0] + first + last);    // ys + 이름 + 성 -> ysseok
    baseWords.push(last[0] + first);           // syunseo (성 앞글자 + 이름 전체)
    baseWords.push(last + first[0] + 's');     // seokys
  }

  // 숫자 조합
  const numberParts = [];
  const y = info.birthYear || '';
  const m = info.birthMonth || '';
  const d = info.birthDay || '';
  if (y && m && d) numberParts.push(y, m + d, y.slice(2) + m + d);
  if (info.phone?.length >= 4) numberParts.push(info.phone.slice(-4));
  if (info.homePhone?.length >= 4) numberParts.push(info.homePhone.slice(-4));
  if (info.options.useFavNums && info.favNums?.length) numberParts.push(...info.favNums);

  const specials = ['!', '@', '#', '$'];
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

function generateMixPasswords(userPw, nordPw, max = 500) {
  const specials = ['!', '@', '#', '$'];
  const mixResults = new Set();

  for (let u of userPw) {
    for (let n of nordPw) {
      for (let s of specials) {
        if (mixResults.size >= max) return Array.from(mixResults);

        const patterns = [u + n + s, n + u + s];
        for (let pw of patterns) {
          if (isValid(pw)) mixResults.add(pw);
        }
      }
    }
  }
  return Array.from(mixResults);
}

export function generatePasswords(info, commonPasswords = []) {
  const userPw = generateFromUserInfo(info);
  const nordPw = generateFromCommonPasswords(commonPasswords);
  const mixPw = generateMixPasswords(userPw, nordPw, 500);

  return {
    user: userPw,
    nord: nordPw,
    mix: mixPw,
  };
}
