// algorithm/generate.js
const leetMap = { a: '@', s: '$', i: '1', o: '0', e: '3' };

/** 비밀번호 유효성 검사 (특수문자 1개만 허용) */
function isValid(pw) {
  const specials = pw.match(/[!@#$]/g) || [];
  return (
    pw.length >= 7 &&
    pw.length <= 10 &&
    /[a-z]/i.test(pw) &&        // 영문 포함
    /[0-9]/.test(pw) &&         // 숫자 포함
    specials.length === 1       // 특수문자 정확히 1개
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

  // 숫자 후보들
  const numberParts = [];
  const y = info.birthYear || '';
  const m = info.birthMonth || '';
  const d = info.birthDay || '';
  if (y && m && d) {
    numberParts.push(y, m + d, y.slice(2) + m + d);
  }

  if (info.phone?.length >= 4) numberParts.push(info.phone.slice(-4));
  if (info.homePhone?.length >= 4) numberParts.push(info.homePhone.slice(-4));
  if (info.options.useFavNums && info.favNums?.length)
    numberParts.push(...info.favNums);

  console.log('[DEBUG] baseWords:', baseWords);
  console.log('[DEBUG] numberParts:', numberParts);

  const specials = ['!', '@', '#', '$']; // 특수문자 제한
  const results = new Set();

  for (let word of baseWords) {
    const cleanWord = word?.toLowerCase()?.trim();
    if (!cleanWord) continue;

    for (let num of numberParts) {
      for (let s of specials) {
        // 1~4번 패턴만 사용
        const patterns = [
          cleanWord + num + s,     // 1. word + num + s
          s + cleanWord + num,     // 2. s + word + num
          cleanWord + s + num,     // 3. word + s + num
          num + cleanWord + s      // 4. num + word + s
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

/** User + Nord 혼합(MIX) 비밀번호 생성 */
function generateMixPasswords(userPw, nordPw, max = 500) {
  const specials = ['!', '@', '#', '$'];
  const mixResults = new Set();

  // user + nord 조합
  for (let u of userPw) {
    for (let n of nordPw) {
      for (let s of specials) {
        if (mixResults.size >= max) return Array.from(mixResults); // 최대 개수 제한

        const patterns = [
          u + n + s,
          n + u + s
        ];

        for (let pw of patterns) {
          if (isValid(pw)) mixResults.add(pw);
        }
      }
    }
  }

  return Array.from(mixResults);
}

/** 최종 호출 함수 (객체 반환) */
export function generatePasswords(info, commonPasswords = []) {
  // 1️⃣ 사용자 기반
  const userPw = generateFromUserInfo(info);

  // 2️⃣ nord 일반 비번 (조건 맞는 것만)
  const nordPw = generateFromCommonPasswords(commonPasswords);

  // 3️⃣ user + nord 혼합 (최대 500개)
  const mixPw = generateMixPasswords(userPw, nordPw, 500);

  console.log('[DEBUG] userPw count:', userPw.length);
  console.log('[DEBUG] nordPw count:', nordPw.length);
  console.log('[DEBUG] mixPw count:', mixPw.length);

  return {
    user: userPw,
    nord: nordPw,
    mix: mixPw
  };
}
