// question.js
import { generatePasswords } from "./algorithm/generate.js";

document.addEventListener("DOMContentLoaded", () => {
  // 스타일 통일
  const style = document.createElement("style");
  style.textContent = `
    body { font-family:'Segoe UI',sans-serif; background:#f5f5f5; margin:0; padding:20px; }
    h2 { margin-bottom:10px; }
    label { display:block; margin-top:15px; font-weight:bold; }
    input, select, button { width:300px; padding:8px; margin-top:5px; font-size:1rem; }
    .hidden { display:none; }
    #resultBox { margin-top:20px; background:#fff; border:1px solid #ccc; padding:10px;
                 width:90%; white-space:pre-wrap; }
    .inline-group { display:flex; align-items:center; gap:10px; }
    button { background:#ff9800; color:#fff; border:none; cursor:pointer; margin-top:15px; }
    button:hover { background:#ffb74d; }
  `;
  document.head.appendChild(style);

  // Step1 UI
  const step1 = document.createElement("div");
  step1.innerHTML = `
    <h2>Step 1: 기본 정보 입력</h2>
    <label>이름</label><input id="firstName" type="text" placeholder="Min" />
    <label>성</label><input id="lastName" type="text" placeholder="Kim" />
    <label>생년월일</label><input id="birth" type="date" />
    <label>전화번호</label><input id="phone" type="text" />
    <label>집전화번호</label>
    <div class="inline-group">
      <input id="homePhone" type="text" />
      <label><input id="noHomePhone" type="checkbox" /> 없음</label>
    </div>
    <button id="toStep2">다음</button>
  `;

  // Step2 UI
  const step2 = document.createElement("div");
  step2.classList.add("hidden");
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
  `;

  const resultBox = document.createElement("div");
  resultBox.id = "resultBox";

  document.body.appendChild(step1);
  document.body.appendChild(step2);
  document.body.appendChild(resultBox);

  // 이벤트: Step1 -> Step2
  document.getElementById("toStep2").addEventListener("click", () => {
    step1.classList.add("hidden");
    step2.classList.remove("hidden");
  });

  // 이벤트: 비밀번호 생성
  document.getElementById("generate").addEventListener("click", async () => {
    const birth = document.getElementById("birth").value.split("-");
    const userData = {
      firstName: document.getElementById("firstName").value.trim(),
      lastName: document.getElementById("lastName").value.trim(),
      nickname: document.getElementById("nickname").value.trim(),
      petNames: document.getElementById("noPet").checked
        ? []
        : document.getElementById("petNames").value.split(",").map(p => p.trim()),
      birthYear: birth[0],
      birthMonth: birth[1],
      birthDay: birth[2],
      phone: document.getElementById("phone").value.trim(),
      favNums: document.getElementById("favNums").value.split(",").map(n => n.trim()).filter(Boolean),
      includeName: document.getElementById("includeName").value === "yes"
    };

    resultBox.textContent = "비밀번호 생성 중...";

    const txtContent = await generatePasswords(userData);

    // 결과 화면에 표시 (앞 30개만)
    const preview = txtContent.split("\n").slice(0, 30).join("\n");
    resultBox.innerHTML = `<pre>${preview}\n... (생략)</pre>`;

    // 다운로드 버튼 추가
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([txtContent], { type: "text/plain" }));
    a.download = "password_dataset.txt";
    a.textContent = "👉 전체 비밀번호 데이터셋 다운로드";
    a.style.display = "block";
    a.style.marginTop = "10px";
    resultBox.appendChild(a);
  });
});
