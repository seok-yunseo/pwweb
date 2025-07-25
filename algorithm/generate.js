<<<<<<< Updated upstream
const leetMap = { a: '@', s: '$', i: '1', o: '0', e: '3' };

function applyLeet(word, useLeet) {
  if (!useLeet) return word;
  return word.split('').map(c => leetMap[c] || c).join('');
}

function isValid(pw) {
  return (
    pw.length >= 7 &&
    pw.length <= 10 &&
    /[a-z]/.test(pw) &&
    /[0-9]/.test(pw) &&
    /[!@#$%^&*]/.test(pw)
  );
}

function generateFromUserInfo(info) {
  const baseWords = [info.nickname, ...(info.petNames || [])];
  if (info.includeName) baseWords.push(info.firstName, info.lastName);

  const numberParts = [];
  if (info.birth) {
    const [y, m, d] = info.birth.split("-");
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
          applyLeet(cleanWord + num, useLeet) + s
        ];
        for (let pw of patterns) {
          if (isValid(pw)) results.add(pw);
          if (results.size >= 10000) return results;
        }
      }
    }
  }

  return results;
}

function generateFromCommonPasswords(commonList) {
  const results = new Set();
  for (let pw of commonList) {
    const lower = pw.toLowerCase().trim();
    if (isValid(lower)) results.add(lower);
    if (results.size >= 10000) break;
  }
  return results;
}

function randomPassword() {
  const abc = "abcdefghijklmnopqrstuvwxyz";
  const nums = "0123456789";
  const special = "!@#$%^&*";
  const pool = abc + nums + special;

  while (true) {
    let pw = "";
    const len = 7 + Math.floor(Math.random() * 4); // 7~10자
    for (let i = 0; i < len; i++) {
      pw += pool[Math.floor(Math.random() * pool.length)];
    }
    if (isValid(pw)) return pw;
  }
}

export function generatePasswords(info, commonPasswords = []) {
  const final = new Set();

  // 1️⃣ 사용자 정보 기반 생성
  const userPw = generateFromUserInfo(info);
  userPw.forEach(p => final.add(p));
  if (final.size >= 10000) return Array.from(final);

  // 2️⃣ nord 사전 기반
  const commonPw = generateFromCommonPasswords(commonPasswords);
  commonPw.forEach(p => final.add(p));
  if (final.size >= 10000) return Array.from(final);

  // 3️⃣ 랜덤 생성 보충
  while (final.size < 10000) {
    final.add(randomPassword());
  }

  return Array.from(final);
=======
// algorithm/generate.js
export async function generatePasswords(userData) {
  // nord 데이터 로드
  const [letters, mixed, numeric] = await Promise.all([
    fetch('/pwdb/nord_letters.json').then(res => res.json()),
    fetch('/pwdb/nord_mixed.json').then(res => res.json()),
    fetch('/pwdb/nord_numeric.json').then(res => res.json())
  ]);

  const specials = "!@#$%^&*";

  // 조건 검사
  function isStrong(pw) {
    return (
      pw.length >= 7 &&
      pw.length <= 10 &&
      /[a-z]/.test(pw) &&
      /\d/.test(pw) &&
      new RegExp(`[${specials}]`).test(pw)
    );
  }

  // 후보 저장
  const sets = { user: new Set(), nord: new Set(), mix: new Set() };

  // 후보 추가
  function addPassword(pw, targetSet) {
    pw = pw.toLowerCase();
    if (isStrong(pw)) targetSet.add(pw);
  }

  // 특수문자 삽입
  function insertSpecials(base) {
    const results = [];
    for (const s of specials) {
      results.push(`${s}${base}`);
      results.push(`${base}${s}`);
      if (base.length > 2) {
        const mid = Math.floor(base.length / 2);
        results.push(`${base.slice(0, mid)}${s}${base.slice(mid)}`);
      }
    }
    return results;
  }

  // 사용자 정보 기반 후보
  function generateUserPasswords() {
    const names = [];

    if (userData.includeName) {
      if (userData.firstName) names.push(userData.firstName.toLowerCase());
      if (userData.lastName) names.push(userData.lastName.toLowerCase());
    }
    if (userData.nickname) names.push(userData.nickname.toLowerCase());
    if (userData.petNames?.length)
      names.push(...userData.petNames.map((p) => p.toLowerCase()));

    if (userData.firstName && userData.lastName) {
      const initials =
        userData.lastName[0].toLowerCase() + userData.firstName[0].toLowerCase();
      names.push(initials);
    }

    const nameVariants = names
      .flatMap((n) => [n, n.slice(0, 3), n.slice(0, 4)])
      .filter(Boolean);

    const nums = [];
    if (userData.birthYear) nums.push(userData.birthYear);
    if (userData.birthMonth && userData.birthDay)
      nums.push(userData.birthMonth + userData.birthDay);
    if (userData.phone) nums.push(userData.phone.slice(-4));
    if (userData.homePhone) nums.push(userData.homePhone.slice(-4));
    if (userData.favNums?.length) nums.push(...userData.favNums);

    nameVariants.forEach((name) => {
      nums.forEach((num) => {
        const bases = [
          `${name}${num}`,
          `${num}${name}`,
          `${name}${num.slice(-2)}`,
          `${num.slice(-2)}${name}`,
        ];
        bases.forEach((base) =>
          insertSpecials(base).forEach((pw) => addPassword(pw, sets.user))
        );
      });
    });
  }

  // nord 기반 후보
  function generateNordPasswords() {
    letters.slice(0, 500).forEach((word) => {
      numeric.forEach((num) => {
        const bases = [`${word}${num}`, `${num}${word}`];
        bases.forEach((base) =>
          insertSpecials(base).forEach((pw) => addPassword(pw, sets.nord))
        );
      });
    });

    mixed.forEach((word) =>
      insertSpecials(word).forEach((pw) => addPassword(pw, sets.nord))
    );

    numeric.forEach((num) =>
      insertSpecials(num).forEach((pw) => addPassword(pw, sets.nord))
    );
  }

  // 혼합 후보
  function generateMixPasswords() {
    const userList = [...sets.user].map((p) => p.replace(/[^a-z0-9]/g, ""));
    const nordList = [...sets.nord].map((p) => p.replace(/[^a-z0-9]/g, ""));
    userList.forEach((u) => {
      nordList.forEach((n) => {
        const bases = [`${u}${n}`, `${n}${u}`];
        bases.forEach((base) =>
          insertSpecials(base).forEach((pw) => addPassword(pw, sets.mix))
        );
      });
    });
  }

  // 전체 실행
  generateUserPasswords();
  generateNordPasswords();
  generateMixPasswords();

  // JSON 형태로 반환
  return {
    user: [...sets.user],
    nord: [...sets.nord],
    mix: [...sets.mix],
  };
>>>>>>> Stashed changes
}
