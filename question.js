// question.js
import { generatePasswords } from './algorithm/generate.js';

<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', () => {
  // 스타일 통일 (start.js와 동일 톤)
  const style = document.createElement('style');
=======
document.addEventListener("DOMContentLoaded", () => {
  const style = document.createElement("style");
>>>>>>> 6ae8d00 (숮어)
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
      width: 500px;
      animation: fadeIn 0.8s ease-in;
      text-align:center;
      max-height: 90vh;
      overflow-y: auto;
    }
    h2 { margin-bottom:15px; font-size:1.5rem; }
    label { display:block; margin-top:12px; text-align:left; }
    input, select, button {
      width:100%; padding:10px; margin-top:6px; font-size:1rem;
      border:none; border-radius:6px;
    }
    input, select {
      background: rgba(255,255,255,0.1);
      color:#fff;
      text-transform: uppercase;
    }
    input:focus, select:focus { outline:2px solid #ff9800; }
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
    .inline-group { display:flex; align-items:center; gap:8px; }
    a.download-link {
      display:block; text-align:center; margin-top:12px; color:#fff;
      text-decoration:none; background:#ff9800; padding:10px; border-radius:6px;
    }
    a.download-link:hover { background:#ffb74d; }
    h3 { margin-top:20px; }
  `;
  document.head.appendChild(style);

<<<<<<< HEAD
  // 컨테이너 생성
  const container = document.createElement('div');
  container.classList.add('container');

  // Step1 UI
  const step1 = document.createElement('div');
=======
  // 컨테이너
  const container = document.createElement("div");
  container.classList.add("container");

  // Step1
  const step1 = document.createElement("div");
>>>>>>> 6ae8d00 (숮어)
  step1.innerHTML = `
    <h2>Step 1: 기본 정보 입력</h2>
    <label>이름</label><input id="firstName" type="text" placeholder="MIN" />
    <label>성</label><input id="lastName" type="text" placeholder="KIM" />
    <label>생년월일</label><input id="birth" type="date" />
    <label>전화번호</label><input id="phone" type="text" />
    <label>집전화번호</label>
    <div class="inline-group">
      <input id="homePhone" type="text" />
      <label><input id="noHomePhone" type="checkbox" /> 없음</label>
    </div>
    <button id="toStep2">다음</button>
  `;

<<<<<<< HEAD
  // Step2 UI
  const step2 = document.createElement('div');
  step2.classList.add('hidden');
=======
  // Step2
  const step2 = document.createElement("div");
  step2.classList.add("hidden");
>>>>>>> 6ae8d00 (숮어)
  step2.innerHTML = `
    <h2>Step 2: 추가 정보 입력</h2>
    <label>별명</label><input id="nickname" type="text" />
    <label>반려동물 이름들 (쉼표로 구분)</label>
    <div class="inline-group">
      <input id="petNames" type="text" />
      <label><input id="noPet" type="checkbox" /> 없음</label>
    </div>
    <label>자주 사용하는 숫자들 (쉼표로 구분)</label><input id="favNums" type="text" />
    <label>비밀번호에 이름 포함?</label>
    <select id="includeName">
      <option value="yes">예</option><option value="no">아니오</option>
    </select>
    <button id="generate">비밀번호 생성</button>
    <!-- 여기에 버튼 추가 -->
  <button id="toPasswordCheck" style="margin-top: 10px;">비밀번호 강도 체크로 이동</button>
  `;

  // 결과 박스
  const resultBox = document.createElement('div');
  resultBox.id = 'resultBox';

  container.appendChild(step1);
  container.appendChild(step2);
  container.appendChild(resultBox);
  document.body.appendChild(container);

<<<<<<< HEAD
  document.getElementById('toPasswordCheck').addEventListener('click', () => {
    window.location.href = 'end.html';
  });

  // 이벤트: Step1 → Step2
  document.getElementById('toStep2').addEventListener('click', () => {
    step1.classList.add('hidden');
    step2.classList.remove('hidden');
  });

  // 이벤트: 비밀번호 생성
  document.getElementById('generate').addEventListener('click', async () => {
    const birth = document.getElementById('birth').value.split('-');
=======
  // Step 전환
  document.getElementById("toStep2").addEventListener("click", () => {
    step1.classList.add("hidden");
    step2.classList.remove("hidden");
  });

  // 비밀번호 생성
  document.getElementById("generate").addEventListener("click", async () => {
    const birth = document.getElementById("birth").value.split("-");
>>>>>>> 6ae8d00 (숮어)
    const userData = {
      firstName: document.getElementById('firstName').value.trim(),
      lastName: document.getElementById('lastName').value.trim(),
      nickname: document.getElementById('nickname').value.trim(),
      petNames: document.getElementById('noPet').checked
        ? []
<<<<<<< HEAD
        : document
            .getElementById('petNames')
            .value.split(',')
            .map((p) => p.trim()),
      birthYear: birth[0],
      birthMonth: birth[1],
      birthDay: birth[2],
      phone: document.getElementById('phone').value.trim(),
      favNums: document
        .getElementById('favNums')
        .value.split(',')
        .map((n) => n.trim())
        .filter(Boolean),
      includeName: document.getElementById('includeName').value === 'yes',
=======
        : document.getElementById("petNames").value.split(",").map((p) => p.trim()),
      birthYear: birth[0],
      birthMonth: birth[1],
      birthDay: birth[2],
      phone: document.getElementById("phone").value.trim(),
      homePhone: document.getElementById("noHomePhone").checked
        ? ""
        : document.getElementById("homePhone").value.trim(),
      favNums: document.getElementById("favNums").value
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean),
      includeName: document.getElementById("includeName").value === "yes",
>>>>>>> 6ae8d00 (숮어)
    };

    resultBox.textContent = '비밀번호 생성 중...';

    const results = await generatePasswords(userData);

<<<<<<< HEAD
    // 결과 미리보기
    const preview = txtContent.split('\n').slice(0, 30).join('\n');
    resultBox.innerHTML = `<pre>${preview}\n... (생략)</pre>`;

    // 다운로드 버튼
    const a = document.createElement('a');
    a.href = URL.createObjectURL(
      new Blob([txtContent], { type: 'text/plain' })
    );
    a.download = 'password_dataset.txt';
    a.textContent = '👉 전체 비밀번호 데이터셋 다운로드';
    a.className = 'download-link';
=======
    // 화면 출력 (각 30개씩)
    resultBox.innerHTML = `
      <h3>USERDATA (총 ${results.user.length}개)</h3>
      <pre>${results.user.slice(0, 30).join("\n")}</pre>
      <h3>NORD (총 ${results.nord.length}개)</h3>
      <pre>${results.nord.slice(0, 30).join("\n")}</pre>
      <h3>MIX (총 ${results.mix.length}개)</h3>
      <pre>${results.mix.slice(0, 30).join("\n")}</pre>
    `;

    // 전체 TXT 다운로드
    const allContent = [
      "=== [USERDATA-ONLY] ===",
      ...results.user,
      "",
      "=== [NORD-ONLY] ===",
      ...results.nord,
      "",
      "=== [MIX] ===",
      ...results.mix,
    ].join("\n");

    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([allContent], { type: "text/plain" }));
    a.download = "password_dataset.txt";
    a.textContent = "👉 전체 비밀번호 데이터셋 다운로드";
    a.className = "download-link";
>>>>>>> 6ae8d00 (숮어)
    resultBox.appendChild(a);
  });
});
