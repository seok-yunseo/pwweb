function collectUserInfoFromForm() {
  const get = id => document.getElementById(id).value.trim();
  const isChecked = id => document.getElementById(id)?.checked;

  return {
    firstName: get("firstName"),
    lastName: get("lastName"),
    birth: get("birth"),
    phone: get("phone"),
    homePhone: isChecked("noHomePhone") ? "" : get("homePhone"),
    nickname: get("nickname"),
    petNames: isChecked("noPet") ? [] : get("petNames").split(',').map(p => p.trim()).filter(Boolean),
    favNums: get("favNums").split(',').map(n => n.trim()).filter(Boolean),
    specialChars: get("specialChars").split(',').map(s => s.trim()).filter(Boolean),
    includeName: get("includeName") === "yes",
    useLeet: get("useLeet") === "yes"
  };
}

function exportUserInfoJSON() {
  const data = collectUserInfoFromForm();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'user_info.json';
  a.click();
}
