// pwstrength.js

// 1. 스타일 추가 (start.js / question.js 스타일 톤에 맞게)
document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = `
    * { margin:0; padding:0; box-sizing:border-box; font-family:'Segoe UI',sans-serif; }
    body {
      display:flex; justify-content:center; align-items:center;
      height:100vh; background:linear-gradient(135deg,#0f2027,#203a43,#2c5364);
      color:#fff; text-align:center;
    }
    .container {
      background: rgba(255,255,255,0.05);
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      width: 400px;
      animation: fadeIn 0.8s ease-in;
      text-align:center;
    }
    h2 { margin-bottom:15px; font-size:1.5rem; }
    input[type="password"] {
      width: 100%; padding:10px; margin-top:6px; font-size:1rem;
      border:none; border-radius:6px;
      background: rgba(255,255,255,0.1);
      color:#fff;
    }
    input[type="password"]:focus {
      outline: 2px solid #ff9800;
    }
    #pwStrength {
      margin-top: 20px;
      text-align: left;
      background: rgba(255,255,255,0.1);
      border-radius: 6px;
      padding: 12px;
      white-space: pre-wrap;
      font-size: 0.9rem;
      min-height: 80px;
    }
    @keyframes fadeIn { 
      from {opacity:0; transform:translateY(15px);} 
      to {opacity:1; transform:translateY(0);} 
    }
  `;
  document.head.appendChild(style);

  // 2. HTML 구조 생성
  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = `
    <h2>비밀번호 강도 체크</h2>
    <input type="password" id="pwInput" placeholder="비밀번호를 입력하세요" autocomplete="off" />
    <p id="pwStrength" style="white-space: pre-line;"></p>
  `;
  document.body.appendChild(container);

  // 3. 기존 translate 함수 + 사전 정의 (복사 붙여넣기)
  function translate(text, dictionary) {
    return dictionary[text] || text;
  }

  const warningTranslations = {
    'Straight rows of keys are easy to guess':
      '키보드에서 연속된 열은 쉽게 추측됩니다.',
    'Short keyboard patterns are easy to guess':
      '짧은 키보드 패턴은 쉽게 추측됩니다.',
    'Repeats like "aaa" are easy to guess':
      '‘aaa’ 같은 반복된 문자열은 쉽게 추측됩니다.',
    'Repeats like "abcabcabc" are only slightly harder to guess than "abc"':
      '‘abcabcabc’ 같은 반복된 문자열은 ‘abc’보다 약간 더 어렵지만 여전히 쉽게 추측됩니다.',
    'Sequences like abc or 6543 are easy to guess':
      'abc나 6543 같은 연속된 문자열은 쉽게 추측됩니다.',
    'Recent years are easy to guess': '최근 연도는 쉽게 추측됩니다.',
    'Dates are often easy to guess': '날짜는 자주 쉽게 추측됩니다.',
    'This is similar to a commonly used password':
      '일반적으로 많이 사용되는 비밀번호와 유사합니다.',
    'This is a top-10 common password':
      '상위 10위 안에 드는 흔한 비밀번호입니다.',
    'This is a top-100 common password':
      '상위 100위 안에 드는 흔한 비밀번호입니다.',
    'This is a very common password': '아주 흔하게 사용되는 비밀번호입니다.',
    'A word by itself is easy to guess':
      '단어 하나만으로 된 비밀번호는 쉽게 추측됩니다.',
    'Names and surnames by themselves are easy to guess':
      '이름이나 성만으로 된 비밀번호는 쉽게 추측됩니다.',
    "Capitalization doesn't help very much":
      '대소문자 구분만으로는 보안에 큰 도움이 되지 않습니다.',
    'All-uppercase is almost as easy to guess as all-lowercase':
      '모두 대문자로 쓰는 것도 모두 소문자만큼 쉽게 추측됩니다.',
    "Reversed words aren't much harder to guess":
      '단어를 뒤집어도 보안성이 크게 향상되지 않습니다.',
    "Predictable substitutions like '@' instead of 'a' don't help very much":
      '‘a’를 ‘@’로 바꾸는 등의 예측 가능한 치환은 큰 도움이 되지 않습니다.',
  };

  const suggestionTranslations = {
    'Use a few words, avoid common phrases':
      '몇 개의 단어만 사용하고 흔한 구문은 피하세요.',
    'No need for symbols, digits, or uppercase letters':
      '기호, 숫자, 대문자는 꼭 필요하지 않습니다.',
    'Add another word or two. Uncommon words are better.':
      '단어를 한두 개 더 추가하세요. 드문 단어가 더 안전합니다.',
    'Use a longer keyboard pattern with more turns':
      '방향 전환이 많은 더 긴 키보드 패턴을 사용하세요.',
    'Avoid repeated words and characters': '반복되는 문자나 단어를 피하세요.',
    'Avoid sequences': '연속된 문자나 숫자(예: abc, 123)를 피하세요.',
    'Avoid recent years': '최근 연도를 사용하지 마세요.',
    'Avoid years that are associated with you':
      '자신과 관련된 연도는 사용하지 마세요.',
    'Avoid dates and years that are associated with you':
      '자신과 관련된 날짜나 연도는 사용하지 마세요.',
    "Capitalization doesn't help very much":
      '대소문자 구분만으로는 보안이 충분하지 않습니다.',
    'All-uppercase is almost as easy to guess as all-lowercase':
      '모두 대문자로 쓰는 것도 모두 소문자만큼 쉽게 추측됩니다.',
    "Reversed words aren't much harder to guess":
      '단어를 뒤집어 쓰는 것은 큰 도움이 되지 않습니다.',
    "Substituting symbols or numbers for letters (e.g. '@' instead of 'a') doesn't help very much":
      '글자를 기호나 숫자로 바꾸는 것은 보안에 큰 도움이 되지 않습니다.',
  };

  // 4. 이벤트 바인딩
  const pwInput = document.getElementById('pwInput');
  const pwStrength = document.getElementById('pwStrength');

  pwInput.addEventListener('input', function () {
    const password = this.value;
    const result = zxcvbn(password);
    const score = result.score;

    const warning = translate(result.feedback.warning, warningTranslations);
    const suggestions = result.feedback.suggestions
      .map((s) => translate(s, suggestionTranslations))
      .join('\n- ');

    const level = ['매우 약함', '약함', '보통', '강함', '매우 강함'];

    let message = `강도: ${level[score]} (${score} / 4)`;
    if (score < 3) {
      if (warning) message += `<br>⚠️ ${warning}`;
      if (suggestions)
        message += `<br>💡 추천 해결책<br> - ${suggestions.replace(
          /\n- /g,
          '<br> - '
        )}`;
    }
    pwStrength.innerHTML = message;
  });
});
