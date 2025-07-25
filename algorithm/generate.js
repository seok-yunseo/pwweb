// algorithm/generate.js
const leetMap = { a: '@', s: '$', i: '1', o: '0', e: '3' };

/** Leet 변환 */
function applyLeet(word, useLeet) {
  if (!useLeet) return word;
  return word
    .split('')
    .map((c) => leetMap[c] || c)
    .join('');
}

/** 비밀번호 유효성 검사 */
function isValid(pw) {
  // 특수문자는 반드시 1개만 사용 (!, @, #, $만 허용)
  const specials = pw.match(/[!@#$]/g) || [];
  return (
    pw.length >= 7 &&
    pw.length <= 10 &&
    /[a-z]/i.test(pw) &&      // 영문 포함
    /[0-9]/.test(pw) &&       // 숫자 포함
    specials.length === 1     // 특수문자 정확히 1개
  );
}

/** 사용자 데이터 기반 비밀번호 생성 */
function generateFromUserInfo(info) {
  const baseWords = [];
  if (info.nickname && info.options.useNick) baseWords.push(info.nickname);
  if (info.petNames?.length && info.options.usePet)
    baseWords.push(...info.petNames);
  if (info.options.useName)
    baseWords.push(info.firstName, info.lastName);
  if (info.options.useInitial && info.firstName && info.lastName)
    baseWords.push(info.firstName[0] + info.lastName[0]);

  const numberParts = [];
  if (info.birth) {
    const [y, m, d] = info.birth.split('-');
    numberParts.push(y, m + d, y.slice(2) + m + d);
  }
  if (info.phone?.length >= 4) numberParts.push(info.phone.slice(-4));
  if (info.homePhone?.length >= 4) numberParts.push(info.homePhone.slice(-4));
  if (info.options.useFavNums && info.favNums?.length)
    numberParts.push(...info.favNums);

  const specials = ['!', '@', '#', '$']; // 특수문자 제한
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

/** Nord/공통 비밀번호 후보 사용 */
function generateFromCommonPasswords(commonList = []) {
  const results = new Set();
  for (let pw of commonList) {
    const clean = pw.toLowerCase().trim();
    if (isValid(clean)) results.add(clean);
  }
  return Array.from(results);
}

/** 최종 호출 함수 */
export function generatePasswords(info, commonPasswords = []) {
  const finalSet = new Set();

  // 1️⃣ 사용자 기반
  const userPw = generateFromUserInfo(info);
  userPw.forEach((pw) => finalSet.add(pw));

  // 2️⃣ nord 일반 비번 (조건 맞는 것만)
  const nordPw = generateFromCommonPasswords(commonPasswords);
  nordPw.forEach((pw) => finalSet.add(pw));

  // 3️⃣ 랜덤 보충 제거 (없으면 없는대로)
  return Array.from(finalSet);
}
