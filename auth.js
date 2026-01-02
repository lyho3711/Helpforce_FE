// Password Validation Functions
function hasConsecutiveChars(password) {
    for (let i = 0; i < password.length - 2; i++) {
        if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
            return true;
        }
    }
    return false;
}

function countCharacterTypes(password) {
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    let count = 0;
    if (hasLetter) count++;
    if (hasNumber) count++;
    if (hasSpecial) count++;

    return count;
}

function validatePassword(password) {
    const validations = {
        length: password.length >= 8 && password.length <= 32,
        types: countCharacterTypes(password) >= 2,
        consecutive: !hasConsecutiveChars(password)
    };

    return validations;
}

// Signup Page Logic
if (document.getElementById('signup-form')) {
    const signupForm = document.getElementById('signup-form');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('password-confirm');
    const emailInput = document.getElementById('email');
    const crmCohortInput = document.getElementById('crm-cohort');

    const authCodeInput = document.getElementById('auth-code');
    const verifyCodeBtn = document.getElementById('verify-code-btn');
    const authCodeMessage = document.getElementById('auth-code-message');
    const signupBtn = signupForm.querySelector('button[type="submit"]');

    // Initial state: disable signup button
    signupBtn.disabled = true;

    // Store verified auth code
    let verifiedAuthCode = null;

    // Verify code logic (still client-side check for UX, backend will verify again)
    verifyCodeBtn.addEventListener('click', () => {
        const code = authCodeInput.value;
        if (code === 'CRM101') {
            authCodeMessage.textContent = '인증이 확인되었습니다';
            authCodeMessage.className = 'validation-message success';
            signupBtn.disabled = false;
            authCodeInput.disabled = true;
            verifyCodeBtn.disabled = true;
            verifyCodeBtn.innerText = '인증완료';
            verifiedAuthCode = code;
        } else {
            authCodeMessage.textContent = '인증 코드가 올바르지 않습니다';
            authCodeMessage.className = 'validation-message error';
            signupBtn.disabled = true;
            authCodeInput.classList.add('shake');
            setTimeout(() => authCodeInput.classList.remove('shake'), 300);
        }
    });

    const reqLength = document.getElementById('req-length');
    const reqTypes = document.getElementById('req-types');
    const reqConsecutive = document.getElementById('req-consecutive');
    const passwordMatchMessage = document.getElementById('password-match-message');

    // Real-time password validation
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const validations = validatePassword(password);

        // Update requirement indicators
        if (validations.length) {
            reqLength.classList.add('met');
        } else {
            reqLength.classList.remove('met');
        }

        if (validations.types) {
            reqTypes.classList.add('met');
        } else {
            reqTypes.classList.remove('met');
        }

        if (validations.consecutive) {
            reqConsecutive.classList.add('met');
        } else {
            reqConsecutive.classList.remove('met');
        }

        // Update input styling
        const allValid = validations.length && validations.types && validations.consecutive;
        if (password.length > 0) {
            if (allValid) {
                passwordInput.classList.add('valid');
                passwordInput.classList.remove('invalid');
            } else {
                passwordInput.classList.add('invalid');
                passwordInput.classList.remove('valid');
            }
        } else {
            passwordInput.classList.remove('valid', 'invalid');
        }

        // Check password match if confirm field has value
        if (passwordConfirmInput.value) {
            checkPasswordMatch();
        }
    });

    // Password confirmation validation
    passwordConfirmInput.addEventListener('input', checkPasswordMatch);

    function checkPasswordMatch() {
        const password = passwordInput.value;
        const passwordConfirm = passwordConfirmInput.value;

        if (passwordConfirm.length === 0) {
            passwordMatchMessage.textContent = '';
            passwordMatchMessage.className = 'validation-message';
            passwordConfirmInput.classList.remove('valid', 'invalid');
            return;
        }

        if (password === passwordConfirm) {
            passwordMatchMessage.textContent = '✓ 비밀번호가 일치합니다';
            passwordMatchMessage.className = 'validation-message success';
            passwordConfirmInput.classList.add('valid');
            passwordConfirmInput.classList.remove('invalid');
        } else {
            passwordMatchMessage.textContent = '✗ 비밀번호가 일치하지 않습니다';
            passwordMatchMessage.className = 'validation-message error';
            passwordConfirmInput.classList.add('invalid');
            passwordConfirmInput.classList.remove('valid');
        }
    }

    // Form submission - Now uses API
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;
        const passwordConfirm = passwordConfirmInput.value;
        const nickname = document.getElementById('nickname').value;
        const crmCohort = crmCohortInput.value;
        const affiliation = document.getElementById('affiliation').value;

        // Validate password
        const validations = validatePassword(password);
        if (!validations.length || !validations.types || !validations.consecutive) {
            alert('비밀번호가 요구사항을 충족하지 않습니다.');
            passwordInput.classList.add('shake');
            setTimeout(() => passwordInput.classList.remove('shake'), 300);
            return;
        }

        // Check password match
        if (password !== passwordConfirm) {
            alert('비밀번호가 일치하지 않습니다.');
            passwordConfirmInput.classList.add('shake');
            setTimeout(() => passwordConfirmInput.classList.remove('shake'), 300);
            return;
        }

        // Disable button during request
        signupBtn.disabled = true;
        signupBtn.textContent = '가입 중...';

        try {
            const result = await API.auth.signup({
                email: email,
                password: password,
                nickname: nickname,
                crm_generation: crmCohort,
                department: affiliation || '',
                auth_code: verifiedAuthCode || authCodeInput.value
            });

            if (result.error) {
                // Handle specific error cases
                if (result.status === 400) {
                    alert(result.message || '잘못된 요청입니다.');
                } else if (result.status === 401) {
                    alert(result.message || '인증코드가 틀렸습니다.');
                } else if (result.status === 409) {
                    alert(result.message || '이미 사용 중인 이메일 또는 닉네임입니다.');
                } else {
                    alert(result.message || '회원가입에 실패했습니다.');
                }
                signupBtn.disabled = false;
                signupBtn.textContent = '가입하기';
                return;
            }

            // Success
            alert('회원가입이 완료되었습니다!');
            window.location.href = 'login.html';

        } catch (error) {
            console.error('Signup error:', error);
            alert('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
            signupBtn.disabled = false;
            signupBtn.textContent = '가입하기';
        }
    });
}

// Login Page Logic
if (document.getElementById('login-form')) {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = loginForm.querySelector('button[type="submit"]');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        if (!email || !password) {
            alert('이메일과 비밀번호를 입력해주세요.');
            return;
        }

        // Disable button during request
        loginBtn.disabled = true;
        loginBtn.textContent = '로그인 중...';

        try {
            const result = await API.auth.login({ email, password });

            if (result.error) {
                if (result.status === 400) {
                    alert(result.message || '이메일과 비밀번호를 입력해주세요.');
                } else if (result.status === 401) {
                    alert(result.message || '이메일 또는 비밀번호가 일치하지 않습니다.');
                } else if (result.status === 403) {
                    alert(result.message || '탈퇴한 회원입니다.');
                } else {
                    alert(result.message || '로그인에 실패했습니다.');
                }
                passwordInput.classList.add('shake');
                setTimeout(() => passwordInput.classList.remove('shake'), 300);
                passwordInput.value = '';
                loginBtn.disabled = false;
                loginBtn.textContent = '로그인';
                return;
            }

            // Store token and user data
            if (result.token) {
                API.setAuthToken(result.token);
            }
            if (result.user) {
                localStorage.setItem('userData', JSON.stringify(result.user));
            }
            localStorage.setItem('isLoggedIn', 'true');

            // Redirect to main page
            window.location.href = 'index.html';

        } catch (error) {
            console.error('Login error:', error);
            alert('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
            loginBtn.disabled = false;
            loginBtn.textContent = '로그인';
        }
    });
}
