import { generatePasswords } from './algorithm/generate.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 스타일 정의
  const style = document.createElement('style');
  style.textContent = `
    * { margin:0; padding:0; box-sizing:border-box; font-family:'Segoe UI',sans-serif; }
    body {
      display:flex; justify-content:center; align-items:center;
      height:100vh; background:linear-gradient(135deg,#0f2027,#203a43,#2c5364);
      color:#fff;
    }
    .container {
      background: rgba(255,255,255,0.05);
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      width: 550px;
      animation: fadeIn 0.8s ease-in;
      text-align:center;
      max-height: 90vh;
      overflow-y: auto;
    }
    h2 { margin-bottom:8px; font-size:1.5rem; }
    .notice { font-size: 0.9rem; color: #ccc; margin-bottom: 18px; }
    label { display:flex; align-items:center; margin-top:12px; justify-content:space-between; }
    .question { text-align:left; flex:1; font-size:1rem; }
    input[type="checkbox"] { width:auto; margin-left: 6px; }
    input[type="text"], input[type="date"], button {
      width:100%; padding:10px; margin-top:6px; font-size:1rem;
      border:none; border-radius:6px;
    }
    input[type="text"], input[type="date"] {
      background: rgba(255,255,255,0.1);
      color:#fff;
      text-transform: none;
    }
    input:focus { outline:2px solid #ff9800; }
    button {
      background:#ff9800; color:#fff; font-weight:bold; cursor:pointer;
      margin-top:18px; transition:background 0.3s;
    }
    button:hover { background:#ffb74d; }
    .hidden { display:none; }
    #resultBox {
      margin-top:20px; text-align:left;
      background: rgba(255,255,255,0.1);
      border-radius: 6px; padding:12px;
      white-space:pre-wrap; font-size:0.9rem;
    }
    h3 { margin-top:20px; }
    a.download-link {
      display:block; text-align:center; margin-top:12px; color:#fff;
      text-decoration:none; background:#ff9800; padding:10px; border-radius:6px;
    }
    a.download-link:hover { background:#ffb74d; }
  `;
  document.head.appendChild(style);

  // 컨테이너
  const container = document.createElement('div');
  container.classList.add('container');

  // Step1
  const step1 = document.createElement('div');
  step1.innerHTML = `
    <h2>Step 1: 기본 정보 입력</h2>
    <div class="notice">※ 사용하지 않는 정보에 대해 체크해주세요.</div>

    <label><span class="question">이름/성 사용</span><input type="checkbox" id="useName" checked /></label>
    <input id="firstName" type="text" placeholder="이름 입력 (예: Min)" />
    <input id="lastName" type="text" placeholder="성 입력 (예: Kim)" />

    <label><span class="question">이니셜 사용 (예: SY)</span><input type="checkbox" id="useInitial" /></label>

    <label><span class="question">생년월일</span><input type="checkbox" id="noBirth" /></label>
    <input id="birth" type="date" />

    <label><span class="question">휴대전화번호</span><input type="checkbox" id="noPhone" /></label>
    <input id="phone" type="text" placeholder="01012345678" />

    <label><span class="question">집전화번호</span><input type="checkbox" id="noHomePhone" /></label>
    <input id="homePhone" type="text" placeholder="집전화번호 (예: 0212345678)" />

    <button id="toStep2">다음</button>
  `;

  // Step2
  const step2 = document.createElement('div');
  step2.classList.add('hidden');
  step2.innerHTML = `
    <h2>Step 2: 추가 정보 입력</h2>

    <label><span class="question">닉네임 사용</span><input type="checkbox" id="useNick" checked /></label>
    <input id="nickname" type="text" placeholder="닉네임 입력" />

    <label><span class="question">반려동물 이름 사용</span><input type="checkbox" id="usePet" checked /></label>
    <input id="petNames" type="text" placeholder="쉼표로 구분 (예: coco, choco)" />

    <label><span class="question">자주 사용하는 숫자 사용</span><input type="checkbox" id="useFavNums" checked /></label>
    <input id="favNums" type="text" placeholder="쉼표로 구분 (예: 77, 14, 99)" />

    <button id="generate">비밀번호 생성</button>
  `;

  // 결과 박스
  const resultBox = document.createElement('div');
  resultBox.id = 'resultBox';

  container.appendChild(step1);
  container.appendChild(step2);
  container.appendChild(resultBox);
  document.body.appendChild(container);

  // 체크박스 → 입력 비활성화
  function toggleInput(checkboxId, inputId) {
    const checkbox = document.getElementById(checkboxId);
    const input = document.getElementById(inputId);
    checkbox.addEventListener('change', () => {
      input.disabled = checkbox.checked;
      if (checkbox.checked) input.value = '';
    });
  }

  toggleInput('noHomePhone', 'homePhone');
  toggleInput('noPhone', 'phone');
  toggleInput('noBirth', 'birth');

  // Step 이동
  document.getElementById('toStep2').addEventListener('click', () => {
    step1.classList.add('hidden');
    step2.classList.remove('hidden');
  });

  // 비밀번호 생성
  document.getElementById('generate').addEventListener('click', async () => {
    const birth = document.getElementById('birth').value.split('-');

    // 사용자 데이터 수집
    const userData = {
      firstName: document.getElementById('firstName').value.trim(),
      lastName: document.getElementById('lastName').value.trim(),
      nickname: document.getElementById('nickname').value.trim(),
      petNames: document
        .getElementById('petNames')
        .value.split(',')
        .map((p) => p.trim())
        .filter(Boolean),
      birthYear: birth[0],
      birthMonth: birth[1],
      birthDay: birth[2],
      phone: document.getElementById('noPhone').checked
        ? ''
        : document.getElementById('phone').value.trim(),
      homePhone: document.getElementById('noHomePhone').checked
        ? ''
        : document.getElementById('homePhone').value.trim(),
      favNums: document
        .getElementById('favNums')
        .value.split(',')
        .map((n) => n.trim())
        .filter(Boolean),
      options: {
        useName: document.getElementById('useName').checked,
        useInitial: document.getElementById('useInitial').checked,
        usePet: document.getElementById('usePet').checked,
        useNick: document.getElementById('useNick').checked,
        useFavNums: document.getElementById('useFavNums').checked,
      },
    };

    resultBox.textContent = '비밀번호 생성 중...';

    // generate.js 내부에서 Nord 데이터까지 직접 fetch해서 처리
    const results = await generatePasswords(userData);

    // 결과 표시
    resultBox.innerHTML = `
      <h3>USERDATA (총 ${results.user.length}개)</h3>
      <pre>${results.user.slice(0, 30).join('\n')}</pre>
      <h3>NORD (총 ${results.nord.length}개)</h3>
      <pre>${results.nord.slice(0, 30).join('\n')}</pre>
      <h3>MIX (총 ${results.mix.length}개)</h3>
      <pre>${results.mix.slice(0, 30).join('\n')}</pre>
    `;

    // 다운로드 링크 추가
    const allContent = [
      '=== [USERDATA-ONLY] ===',
      ...results.user,
      '',
      '=== [NORD-ONLY] ===',
      ...results.nord,
      '',
      '=== [MIX] ===',
      ...results.mix,
    ].join('\n');

    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([allContent], { type: 'text/plain' }));
    a.download = 'password_dataset.txt';
    a.textContent = '👉 전체 비밀번호 데이터셋 다운로드';
    a.className = 'download-link';
    resultBox.appendChild(a);
  });
});
