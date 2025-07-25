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
  if (!(info.options.useInitial)) {
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
    numberParts.push(info.birthYear); // 예: "1995"
    numberParts.push(info.birthYear.slice(2)); // 예: "95"
    numberParts.push(info.birthMonth); // 예: "05"
    numberParts.push(info.birthDay); // 예: "17"
    numberParts.push(info.birthMonth + info.birthDay); // 예: "0517"
    numberParts.push(info.birthYear.slice(2) + info.birthMonth + info.birthDay); // "950517"
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
// Mix: user baseWords + numberParts + nordWords + nord numberParts
function generateMixPasswords(
  userWords = [],
  userNumbers = [],
  nordWords = [],
  nordNumbers = [],
  max = 500
) {
  const specials = ['!', '@', '#', '$'];
  const mixResults = new Set();

  for (let uw of userWords) {
    for (let nn of nordNumbers) {
      for (let nw of nordWords) {
        for (let un of userNumbers) {
          for (let s of specials) {
            if (mixResults.size >= max) return Array.from(mixResults);

            // 1. s + uw + nn
            const p1 = `${s}${uw}${nn}`;
            // 2. s + nn + uw
            const p2 = `${s}${nn}${uw}`;
            // 3. s + nw + un
            const p3 = `${s}${nw}${un}`;
            // 4. s + un + nw
            const p4 = `${s}${un}${nw}`;

            // 5. uw + nn + s
            const p5 = `${uw}${nn}${s}`;
            // 6. nn + uw + s
            const p6 = `${nn}${uw}${s}`;
            // 7. nw + un + s
            const p7 = `${nw}${un}${s}`;
            // 8. un + nw + s
            const p8 = `${un}${nw}${s}`;

            const patterns = [p1, p2, p3, p4, p5, p6, p7, p8];

            for (let pw of patterns) {
              if (isValid(pw)) mixResults.add(pw);
            }
          }
        }
      }
    }
  }

  console.log('[DEBUG] mix count:', mixResults.size);
  return Array.from(mixResults);
}


// 최종 함수
export async function generatePasswords(info) {
  // 1. userData
  const { pw: userPw, numberParts: userNum } = generateFromUserInfo(info);

  // 2. nordData
  const { nordWord, nordNum } = await loadNordData();

  // 3. mixed
  const mixPw = generateMixPasswords(userPw, userNum, nordWord, nordNum, 500);

  // 4. nord만
  const nordPw = generateFromNordWords(nordWord, nordNum);

  return { user: userPw, nord: nordPw, mix: mixPw };
}

