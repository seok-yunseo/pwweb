const leetMap = { a: '@', s: '$', i: '1', o: '0', e: '3' };

function applyLeet(word, useLeet) {
  if (!useLeet) return word;
  return word.split('').map(c => leetMap[c] || c).join('');
}

function loadUserInfo() {
  const file = document.getElementById("fileInput").files[0];
  if (!file) {
    alert("user_info.json 파일을 선택하세요.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const info = JSON.parse(e.target.result);
    const passwords = generatePasswords(info);
    const resultEl = document.getElementById("result");

    resultEl.innerHTML =
      `✅ 총 ${passwords.length}개의 비밀번호가 생성되었습니다.\n\n샘플:\n` +
      passwords.slice(0, 10).join('\n');

    const blob = new Blob([passwords.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'generated_passwords.txt';
    a.textContent = '👉 예상 비밀번호 파일 다운로드';
    a.className = 'download-link';
    resultEl.appendChild(document.createElement('br'));
    resultEl.appendChild(a);
  };
  reader.readAsText(file);
}

function generatePasswords(info) {
  const baseWords = [info.nickname, ...(info.petNames || [])];
  if (info.includeName) {
    baseWords.push(info.firstName, info.lastName);
  }

  const numberParts = [];
  if (info.birth) {
    const [y, m, d] = info.birth.split("-");
    numberParts.push(y, m + d);
  }
  if (info.phone?.length >= 4) numberParts.push(info.phone.slice(-4));
  if (info.homePhone?.length >= 4) numberParts.push(info.homePhone.slice(-4));
  numberParts.push(...(info.favNums || []));

  const specials = info.specialChars?.filter(Boolean) || ['!'];
  const useLeet = info.useLeet;

  const passwords = new Set();

  outer: for (let word of baseWords) {
    for (let num of numberParts) {
      for (let s of specials) {
        const combos = [
          word + num + s,
          s + word + num,
          word + s + num,
          num + word + s,
          applyLeet(word, useLeet) + num + s,
          applyLeet(word + num, useLeet) + s
        ];
        for (let pw of combos) {
          if (pw.length >= 7 && pw.length <= 10 && /[!@#$%^&*]/.test(pw)) {
            passwords.add(pw);
            if (passwords.size >= 10000) break outer;
          }
        }
      }
    }
  }

  // 부족 시 랜덤 보충
  const abc = "abcdefghijklmnopqrstuvwxyz";
  const extra = "!@#$%^&*";
  while (passwords.size < 10000) {
    let pw = "";
    const len = 7 + Math.floor(Math.random() * 4);
    for (let i = 0; i < len - 1; i++) {
      pw += abc[Math.floor(Math.random() * abc.length)];
    }
    pw += extra[Math.floor(Math.random() * extra.length)];
    passwords.add(pw);
  }

  return Array.from(passwords);
}
