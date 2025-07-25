const leetMap = { a: '@', s: '$', i: '1', o: '0', e: '3' };

function applyLeet(word, useLeet) {
  if (!useLeet) return word;
  return word
    .split('')
    .map((c) => leetMap[c] || c)
    .join('');
}

function isValidName(name) {
  return /^[A-Z][a-z]+$/.test(name);
}

function goToStep2() {
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const birth = document.getElementById('birth').value;
  const phone = document.getElementById('phone').value.trim();

  if (!isValidName(firstName) || !isValidName(lastName)) {
    alert(
      '이름과 성은 영어로 입력하고, 이니셜만 대문자로 작성해야 합니다. 예: Min, Kim'
    );
    return;
  }
  if (!birth) {
    alert('생년월일을 입력해주세요.');
    return;
  }
  if (!phone) {
    alert('전화번호를 입력해주세요.');
    return;
  }

  document.getElementById('step1').classList.add('hidden');
  document.getElementById('step2').classList.remove('hidden');
}

function generatePasswords() {
  const firstName = document
    .getElementById('firstName')
    .value.trim()
    .toLowerCase();
  const lastName = document
    .getElementById('lastName')
    .value.trim()
    .toLowerCase();
  const birth = document.getElementById('birth').value;
  const phone = document.getElementById('phone').value.trim();
  const homePhone = document.getElementById('noHomePhone').checked
    ? ''
    : document.getElementById('homePhone').value.trim();

  const nickname = document
    .getElementById('nickname')
    .value.trim()
    .toLowerCase();
  const petNames = document.getElementById('noPet').checked
    ? []
    : document
        .getElementById('petNames')
        .value.split(',')
        .map((p) => p.trim().toLowerCase());
  const favNums = document
    .getElementById('favNums')
    .value.split(',')
    .map((n) => n.trim())
    .filter(Boolean);
  const specialChars = document
    .getElementById('specialChars')
    .value.split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const includeName = document.getElementById('includeName').value === 'yes';
  const useLeet = document.getElementById('useLeet').value === 'yes';

  if (specialChars.length === 0) {
    alert('최소 하나 이상의 특수문자를 입력해주세요.');
    return;
  }

  const baseWords = [nickname, ...petNames];
  if (includeName) baseWords.push(firstName, lastName);

  const numberParts = [];
  if (birth) {
    const [y, m, d] = birth.split('-');
    numberParts.push(y, m + d);
  }
  numberParts.push(...favNums);
  if (phone.length >= 4) numberParts.push(phone.slice(-4));
  if (homePhone.length >= 4) numberParts.push(homePhone.slice(-4));

  const passwords = new Set();

  outer: for (let word of baseWords) {
    for (let num of numberParts) {
      for (let s of specialChars) {
        const combos = [
          word + num + s,
          s + word + num,
          word + s + num,
          num + word + s,
          applyLeet(word, useLeet) + num + s,
          applyLeet(word + num, useLeet) + s,
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

  const pwList = Array.from(passwords);
  document.getElementById(
    'resultBox'
  ).innerText = `✅ 비밀번호 생성 완료. 아래 버튼을 눌러 다운로드하세요.`;

  const blob = new Blob([pwList.join('\n')], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'generated_passwords.txt';
  a.textContent = '👉 예상 비밀번호 파일 다운로드';
  a.style.display = 'inline-block';
  a.style.marginTop = '10px';
  document.getElementById('resultBox').appendChild(a);
}
