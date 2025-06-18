let currentSubject = "";
let currentGenre = "";
let questions = [];
let currentMode = "choice";
let numQuestions;

function changeScreen(id) {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function selectSubject(subject) {
    currentSubject = subject;
    const now = Date.now();
    fetch(`${subject}/data.json?t=${now}`)  // キャッシュ防止のためのタイムスタンプ追加
        .then(res => res.json())
        .then(data => {
            const genreList = document.getElementById("genreList");
            genreList.innerHTML = "";
            data.forEach(entry => {
                const btn = document.createElement("button");
                btn.textContent = entry.genre;
                btn.onclick = () => {
                    currentGenre = entry.genre;
                    questions = shuffleArray(entry.list);
                    changeScreen("questionCount");
                    showSlider(Object.keys(entry.list).length);
                };
                genreList.appendChild(btn);
            });
            changeScreen("genre");
        });
}

function showSlider(count) {
    document.getElementById("sliderContainer").innerHTML = `
        <label>問題数: <span id="questionCountDisplay">${Math.floor(count / 2)}</span>問</label>
        <input id="questionSlider" type="range" min="1" max="${count}" value="${Math.floor(count / 2)}"
            oninput="updateQuestionCountDisplay(this.value)">
    `;
    changeScreen("questionCount");
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function updateQuestionCountDisplay(val) {
    document.getElementById("questionCountDisplay").textContent = val;
}

function showFeedback(isCorrect) {
    const feedback = document.createElement("p");
    feedback.textContent = isCorrect ? "正解！" : "不正解…";
    feedback.style.color = isCorrect ? "green" : "red";
    feedback.style.fontSize = "3vw";
    feedback.style.position = "absolute";
    feedback.style.bottom = "0.5vw";
    document.getElementById("quiz").appendChild(feedback);
    setTimeout(() => feedback.remove(), 1000);  // 修正：文法エラー解消
}

function selectMode(mode) {
    currentMode = mode;
    numQuestions = document.getElementById("questionSlider").value;
    startQuiz();
}

function startQuiz() {
    currentIndex = 0;
    score = 0;
    startTime = Date.now();
    document.getElementById("listContainer").textContent = '';
    showQuestion();
    changeScreen("quiz");
}

let currentIndex = 0;
let score = 0;
let startTime = 0;
let keyboardtype = 'hankaku';

function showQuestion() {
    const q = questions[currentIndex];
    document.getElementById("questionText").textContent = q.question;
    const optionArea = document.getElementById("optionArea");
    optionArea.innerHTML = "";

    if (currentMode === "choice") {
        const shuffleOptions = shuffleArray(q.options);
        shuffleOptions.forEach((opt, i) => {
            const btn = document.createElement("button");
            btn.textContent = opt;
            btn.onclick = () => {
                if (opt === q.answer) {
                    score++;
                    showFeedback(true);
                } else showFeedback(false);
                nextQuestion(opt);
            };
            optionArea.appendChild(btn);
        });

        document.onkeydown = (e) => {
            if (e.key === 'Escape') {
                changeScreen('result');
            }
        }
    } else {
        const span = document.createElement("span");
        span.classList.add("input-area");
        span.style.fontSize = "3vw";
        span.style.outline = "none";
        span.contentEditable = "true";
        span.textContent = "";
        optionArea.appendChild(span);
        
        setTimeout(() => {
            span.focus();
        }, 0);

        let rawInput = "";

        // キーボード入力イベントの処理
        const handleKeyDown = (e) => {
            rawInput = span.textContent;
            if (e.key === 'Process') {
                return;
            } else if (e.key === "Enter") {
                e.preventDefault(); // 改行防止
                const answerInput = span.textContent;
                if (answerInput === q.answer) {
                    score++;
                    showFeedback(true);
                } else {
                    showFeedback(false);
                }
                document.removeEventListener("keydown", handleKeyDown);
                nextQuestion(answerInput);
                return;
            } else if (e.key === "Backspace") {
                e.preventDefault();
                rawInput = rawInput.slice(0, -1);
            } else if (e.key.length === 1) {
                e.preventDefault();
                rawInput += e.key;
            } else if (e.key === "Escape") {
                e.preventDefault();
                changeScreen("result");
                return;
            }

            // spanの表示を更新
            span.textContent = rawInput;

            // 正解判定（早期クリア時）
            const answerInput = span.textContent;
            if (answerInput === q.answer) {
                score++;
                showFeedback(true);
                document.removeEventListener("keydown", handleKeyDown);
                nextQuestion(answerInput);
                return;
            }

            console.log(e.key);
        };

        document.addEventListener("keydown", handleKeyDown);
    }
}

function nextQuestion(userAnswer) {
    const currentQuestion = questions[currentIndex].question;
    const currentAnswer = questions[currentIndex].answer;

    const div = document.createElement("div");

    div.innerHTML = `
        <p>${currentIndex + 1}問目　<span style="color: ${currentAnswer === userAnswer ? 'green' : 'red'}">${currentAnswer === userAnswer ? '○正解' : '×不正解'}</span></p>
        <h3>${currentQuestion}</h3>
        <p>正解: ${currentAnswer}</p>
        <p>答え: ${userAnswer}</p>
        <hr>
    `;

    document.getElementById("listContainer").appendChild(div);

    currentIndex++;
    if (currentIndex >= numQuestions || currentIndex >= questions.length) {
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        document.getElementById("timeResult").textContent = `クリア時間: ${timeTaken}秒`;
        document.getElementById("scoreResult").textContent = `スコア: ${score} / ${currentIndex}`;
        changeScreen("result");
        if (score === currentIndex) confetti();
    } else {
        showQuestion();
    }
}

function showKeyboardType() {
    const element = document.querySelector('#keyboardType'); // または .class や tag名など

    if (element) {
        element.remove();
    }

    const keyboard = document.createElement("p");
    if (keyboardtype === 'hankaku') keyboard.textContent = 'Aa';
    else keyboard.textContent = 'あ';

    keyboard.id = 'keyboardType';
    keyboard.style.position = 'absolute';
    keyboard.style.bottom = '1vw';
    keyboard.style.right = '1vw';
    keyboard.style.fontSize = '2vw';

    document.getElementById("quiz").appendChild(keyboard);
}

function convertToHiragana(input) {
    return wanakana.toHiragana(input);
}

function resetGame() {
    changeScreen("home");
}
