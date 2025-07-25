// algorithm/generate.js
export async function generatePasswords(userData) {
  const [letters, mixed, numeric] = await Promise.all([
    fetch('/pwdb/nord_letters.json').then(res => res.json()),
    fetch('/pwdb/nord_mixed.json').then(res => res.json()),
    fetch('/pwdb/nord_numeric.json').then(res => res.json())
  ]);

  const specials = "!@#$%^&*";
  const hasSpecial = (pw) => [...pw].some(c => specials.includes(c));
  const isValidLength = (pw) => pw.length >= 7 && pw.length <= 10;

  // 사용자 정보 기반 단어 & 숫자
  const baseWords = [];
  if (userData.includeName) {
    baseWords.push(userData.firstName.toLowerCase(), userData.lastName.toLowerCase());
  }
  if (userData.nickname) baseWords.push(userData.nickname.toLowerCase());
  if (userData.petNames?.length) baseWords.push(...userData.petNames.map(p => p.toLowerCase()));

  const numbers = [];
  if (userData.birthYear && userData.birthMonth && userData.birthDay) {
    numbers.push(userData.birthYear, userData.birthMonth + userData.birthDay);
  }
  if (userData.phone) numbers.push(userData.phone.slice(-4));
  if (userData.favNums?.length) numbers.push(...userData.favNums);

  // 세트 생성
  const nordSet = new Set();
  const userSet = new Set();
  const mixSet = new Set();

  // --- userData 전용 ---
  baseWords.forEach(word => {
    numbers.forEach(num => {
      specials.split('').forEach(s => {
        const candidates = [
          `${word}${num}${s}`,
          `${s}${word}${num}`,
          `${word}${s}${num}`,
          `${num}${word}${s}`
        ];
        candidates.forEach(pw => {
          if (isValidLength(pw) && hasSpecial(pw)) {
            userSet.add(pw);
            mixSet.add(pw);
          }
        });
      });
    });
  });

  // --- nord 데이터 전용 ---
  letters.forEach(word => {
    specials.split('').forEach(s => {
      const candidates = [`${word}${s}`, `${s}${word}`];
      candidates.forEach(pw => {
        if (isValidLength(pw) && hasSpecial(pw)) {
          nordSet.add(pw);
          mixSet.add(pw);
        }
      });
    });
  });

  mixed.forEach(word => {
    if (isValidLength(word) && hasSpecial(word)) {
      nordSet.add(word);
      mixSet.add(word);
    }
  });

  numeric.forEach(num => {
    specials.split('').forEach(s => {
      const pw = `${num}${s}`;
      if (isValidLength(pw) && hasSpecial(pw)) {
        nordSet.add(pw);
        mixSet.add(pw);
      }
    });
  });

  // 하나의 TXT 내용으로 합치기
  let txtContent = "";
  txtContent += "=== [NORD-ONLY] ===\n";
  txtContent += Array.from(nordSet).join("\n") + "\n\n";
  txtContent += "=== [USERDATA-ONLY] ===\n";
  txtContent += Array.from(userSet).join("\n") + "\n\n";
  txtContent += "=== [MIX] ===\n";
  txtContent += Array.from(mixSet).join("\n");

  return txtContent;
}
