// algorithm/generate.js
export async function generatePasswords(userData) {
  // Nord 데이터 로드
  const [letters, mixed, numeric] = await Promise.all([
    fetch('/pwdb/nord_letters.json').then(res => res.json()),
    fetch('/pwdb/nord_mixed.json').then(res => res.json()),
    fetch('/pwdb/nord_numeric.json').then(res => res.json())
  ]);

  const specials = "!@#$%^&*";

  /** 조건 검사 (문자/숫자/특수문자 모두 포함, 7~10자) */
  function isStrong(pw) {
    return (
      pw.length >= 7 &&
      pw.length <= 10 &&
      /[a-z]/.test(pw) &&
      /\d/.test(pw) &&
      new RegExp(`[${specials}]`).test(pw)
    );
  }

  const sets = { user: new Set(), nord: new Set(), mix: new Set() };

  /** 비밀번호 추가 */
  function addPassword(pw, targetSet) {
    pw = pw.toLowerCase();
    if (isStrong(pw)) targetSet.add(pw);
  }

  /** 특수문자 앞/뒤만 넣기 */
  function insertSpecials(base) {
    const results = [];
    for (const s of specials) {
      results.push(`${s}${base}`);
      results.push(`${base}${s}`);
    }
    return results;
  }

  /** 사용자 정보 기반 후보 */
  function generateUserPasswords() {
    const names = [];

    // 이름/성
    if (userData.options.useName) {
      if (userData.firstName) names.push(userData.firstName.toLowerCase());
      if (userData.lastName) names.push(userData.lastName.toLowerCase());
    }

    // 닉네임
    if (userData.options.useNick && userData.nickname) {
      names.push(userData.nickname.toLowerCase());
    }

    // 반려동물 이름
    if (userData.options.usePet && userData.petNames?.length) {
      names.push(...userData.petNames.map((p) => p.toLowerCase()));
    }

    // 이니셜 (성+이름 첫 글자)
    if (
      userData.options.useInitial &&
      userData.firstName &&
      userData.lastName
    ) {
      const initials =
        userData.lastName[0].toLowerCase() + userData.firstName[0].toLowerCase();
      names.push(initials);
    }

    // 이름/닉네임 일부 (앞 3~4자)
    const nameVariants = names
      .flatMap((n) => [n, n.slice(0, 3), n.slice(0, 4)])
      .filter(Boolean);

    // 숫자 후보
    const nums = [];
    if (userData.birthYear) nums.push(userData.birthYear);
    if (userData.birthMonth && userData.birthDay)
      nums.push(userData.birthMonth + userData.birthDay);
    if (userData.phone) nums.push(userData.phone.slice(-4));
    if (userData.homePhone) nums.push(userData.homePhone.slice(-4));
    if (userData.favNums?.length) nums.push(...userData.favNums);

    // 이름/닉네임 + 숫자 + 특수문자 조합
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

  /** Nord 데이터 기반 후보 */
  function generateNordPasswords() {
    // nord_letters: 상위 300개만 사용해서 속도 최적화
    letters.slice(0, 300).forEach((word) => {
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

  /** 혼합 후보 (UserData + Nord) */
  function generateMixPasswords() {
    const userList = [...sets.user].map((p) => p.replace(/[^a-z0-9]/g, ""));
    const nordList = [...sets.nord].map((p) => p.replace(/[^a-z0-9]/g, ""));
    let count = 0;

    for (const u of userList) {
      for (const n of nordList) {
        // 조합 개수 제한 (최대 500개)
        if (count++ > 500) return;

        const bases = [`${u}${n}`, `${n}${u}`];
        bases.forEach((base) =>
          insertSpecials(base).forEach((pw) => addPassword(pw, sets.mix))
        );
      }
    }
  }

  // 전체 실행
  generateUserPasswords();   // 옵션 적용
  generateNordPasswords();   // 항상 실행
  generateMixPasswords();    // 항상 실행

  // JSON으로 반환
  return {
    user: [...sets.user],
    nord: [...sets.nord],
    mix: [...sets.mix],
  };
}
