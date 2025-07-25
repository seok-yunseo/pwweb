// nord 데이터 파일 경로 설정
const NORD_FILES = {
  letters: './pwdb/nord_letters.json',
  mixed: './pwdb/nord_mixed.json',
  numeric: './pwdb/nord_numeric.json',
};

async function loadNordData() {
  const [letters, mixed, numeric] = await Promise.all([
    fetch(NORD_FILES.letters).then((r) => r.json()),
    fetch(NORD_FILES.mixed).then((r) => r.json()),
    fetch(NORD_FILES.numeric).then((r) => r.json()),
  ]);

  return {
    nordWord: [...letters, ...mixed],
    nordNum: numeric,
  };
}

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

// Userdata 기반 생성
function generateFromUserInfo(info) {
  const baseWords = [];

  // 닉네임, 반려동물 이름
  if (!(info.options.useNick) && info.nickname) {
    baseWords.push(info.nickname.toLowerCase());
  }
  if (!(info.options.usePet) && info.petNames?.length) {
    baseWords.push(...info.petNames.map((p) => p.toLowerCase()));
  }

  // 이름, 성
  if (!(info.options.useName)) {
    if (info.firstName) baseWords.push(info.firstName.toLowerCase());
    if (info.lastName) baseWords.push(info.lastName.toLowerCase());
  }

  // 이니셜
  if (info.options.useInitial) {
    const initialsLast = [];
    const initialsFirst = [];

    if (info.lastName) {
      for (const ch of info.lastName) {
        if (/[A-Z]/.test(ch)) initialsLast.push(ch.toLowerCase());
      }
    }
    if (info.firstName) {
      for (const ch of info.firstName) {
        if (/[A-Z]/.test(ch)) initialsFirst.push(ch.toLowerCase());
      }
    }

    if (initialsLast.length || initialsFirst.length) {
      const combinations = new Set();
      for (const l of initialsLast) {
        if (initialsFirst.length) {
          combinations.add(l + initialsFirst.join(""));
          combinations.add(initialsFirst.join("") + l);
        } else {
          combinations.add(l);
        }
      }
      if (initialsFirst.length) combinations.add(initialsFirst.join(""));
      if (initialsFirst.length && info.lastName)
        combinations.add(initialsFirst.join("") + info.lastName.toLowerCase());

      initialsLast.forEach((ch) => combinations.add(ch));
      initialsFirst.forEach((ch) => combinations.add(ch));

      baseWords.push(...combinations);
    }
  }

  // 숫자 파트
  const numberParts = [];
  if (info.birthYear && info.birthMonth && info.birthDay) {
    numberParts.push(info.birthYear);
    numberParts.push(info.birthMonth + info.birthDay);
    numberParts.push(info.birthYear.slice(2) + info.birthMonth + info.birthDay);
  }
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
          cleanWord + num + s,
          s + cleanWord + num,
          s + num + cleanWord,
          num + cleanWord + s,
        ];
        for (let pw of patterns) {
          if (isValid(pw)) results.add(pw);
        }
      }
    }
  }

  console.log("[DEBUG] user baseWords:", baseWords, "numberParts:", numberParts, "count:", results.size);
  return { pw: Array.from(results), numberParts };
}

// Nord 기반 생성
function generateFromNordWords(nordWords = [], numberParts = []) {
  const specials = ['!', '@', '#', '$'];
  const results = new Set();
  for (let word of nordWords) {
    const cleanWord = word?.toLowerCase()?.trim();
    if (!cleanWord) continue;

    for (let num of numberParts) {
      for (let s of specials) {
        const patterns = [
          cleanWord + num + s,
          s + cleanWord + num,
          s + num + cleanWord,
          num + cleanWord + s,
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

// Mix: userWord + nordNum
function generateMixPasswords(userWords, nordNumWords = [], max = 500) {
  const specials = ['!', '@', '#', '$'];
  const mixResults = new Set();

  for (let u of userWords) {
    for (let n of nordNumWords) {
      for (let s of specials) {
        if (mixResults.size >= max) return Array.from(mixResults);

        const patterns = [u + n + s, n + u + s, s + u + n, s + n + u];
        for (let pw of patterns) {
          if (isValid(pw)) mixResults.add(pw);
        }
      }
    }
  }
  console.log('[DEBUG] mix count:', mixResults.size);
  return Array.from(mixResults);
}

// 최종 함수
export async function generatePasswords(info) {
  const { pw: userPw, numberParts } = generateFromUserInfo(info);

  // Nord 데이터 직접 로딩
  const { nordWord, nordNum } = await loadNordData();

  // Nord는 userData와 무관하게 생성
  const nordPw = generateFromNordWords(nordWord, nordNum);

  // Mix: user + nordNum
  const mixPw = generateMixPasswords(userPw, nordNum, 500);

  return { user: userPw, nord: nordPw, mix: mixPw };
}
