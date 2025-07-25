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

/** 사용자 데이터 기반 패턴 */
function generateFromUserInfo(info) {
  const baseWords = [];

  // 닉네임, 반려동물 이름
  if (info.options.useNick && info.nickname)
    baseWords.push(info.nickname.toLowerCase());
  if (info.options.usePet && info.petNames?.length)
    baseWords.push(...info.petNames.map((p) => p.toLowerCase()));

  // 이름, 성
  if (info.options.useName) {
    if (info.firstName) baseWords.push(info.firstName.toLowerCase());
    if (info.lastName) baseWords.push(info.lastName.toLowerCase());
  }

  // 대문자 이니셜 -> 소문자화
  if (info.options.useInitial) {
    const initials = (info.firstName + info.lastName)
      .split('')
      .filter((ch) => /[A-Z]/.test(ch))
      .join('')
      .toLowerCase();

    if (initials.length >= 2 && info.lastName && info.firstName) {
      baseWords.push(initials); // ys
      baseWords.push(initials + 's'); // yss
      baseWords.push(initials + info.lastName.toLowerCase()); // ysseok
      baseWords.push(initials[0] + info.firstName.toLowerCase()); // ysunseo
      baseWords.push(info.lastName.toLowerCase() + initials); // seokys
    }
  }

  // 숫자 파트
  const numberParts = [];
  const y = info.birthYear || '';
  const m = info.birthMonth || '';
  const d = info.birthDay || '';
  if (y && m && d) numberParts.push(y, m + d, y.slice(2) + m + d);
  if (info.phone?.length >= 4) numberParts.push(info.phone.slice(-4));
  if (info.homePhone?.length >= 4) numberParts.push(info.homePhone.slice(-4));
  if (info.options.useFavNums && info.favNums?.length)
    numberParts.push(...info.favNums);

  const specials = ['!', '@', '#', '$'];
  const results = new Set();

  for (let word of baseWords) {
    const cleanWord = word?.trim();
    if (!cleanWord) continue;

    for (let num of numberParts) {
      for (let s of specials) {
        const patterns = [
          cleanWord + num + s, // 1
          s + cleanWord + num, // 2
          s + num + cleanWord, // 3
          num + cleanWord + s, // 4
        ];
        for (let pw of patterns) {
          if (isValid(pw)) results.add(pw);
        }
      }
    }
  }

  console.log(
    '[DEBUG] user baseWords:',
    baseWords,
    'numberParts:',
    numberParts,
    'count:',
    results.size
  );

  return {
    pw: Array.from(results),
    numberParts,
  };
}

/** Nord(letters + mixed) 기반 패턴 */
function generateFromNordWords(nordWords = [], numberParts = []) {
  const specials = ['!', '@', '#', '$'];
  const results = new Set();

  for (let word of nordWords) {
    const cleanWord = word?.toLowerCase()?.trim();
    if (!cleanWord) continue;

    for (let num of numberParts) {
      for (let s of specials) {
        const patterns = [
          cleanWord + num + s, // 1
          s + cleanWord + num, // 2
          s + num + cleanWord, // 3
          num + cleanWord + s, // 4
        ];
        for (let pw of patterns) {
          if (isValid(pw)) results.add(pw);
        }
      }
    }
  }

  console.log('[DEBUG] nordWords count:', results.size);
  return Array.from(results);
}

/** Mix: userWord + nordNum */
function generateMixPasswords(userWords, nordNumWords = [], max = 500) {
  const specials = ['!', '@', '#', '$'];
  const mixResults = new Set();

  for (let u of userWords) {
    for (let n of nordNumWords) {
      for (let s of specials) {
        if (mixResults.size >= max) return Array.from(mixResults);

        const patterns = [
          u + n + s, // 1
          n + u + s, // 2
          s + u + n, // 3
          s + n + u, // 4
        ];

        for (let pw of patterns) {
          if (isValid(pw)) mixResults.add(pw);
        }
      }
    }
  }

  console.log('[DEBUG] mix count:', mixResults.size);
  return Array.from(mixResults);
}

/** 최종 함수 */
export function generatePasswords(
  info,
  nordData = { nordWord: [], nordNum: [] }
) {
  const { nordWord, nordNum } = nordData;

  // 1️⃣ User 기반
  const { pw: userPw, numberParts } = generateFromUserInfo(info);

  // 2️⃣ Nord 기반 (letters + mixed)
  const nordPw = generateFromNordWords(nordWord, nordNum);

  // 3️⃣ Mix (userWords + nordNum)
  const mixPw = generateMixPasswords(userPw, nordNum, 500);

  return {
    user: userPw,
    nord: nordPw,
    mix: mixPw,
  };
}
