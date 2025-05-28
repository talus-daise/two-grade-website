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
        <label>問題数: <span id="questionCountDisplay">10</span>問</label>
        <input id="questionSlider" type="range" min="1" max="${count}" value="10"
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
                nextQuestion();
            };
            optionArea.appendChild(btn);
        });

        document.onkeydown = (e) => {
            if (e.key === 'Escape') {
                changeScreen('result');
            }
        }
    } else {
        let input = "";
        showKeyboardType();
        const span = document.createElement("span");
        span.classList.add("input-area");
        span.style.fontSize = "3vw";
        span.textContent = input;
        optionArea.appendChild(span);

        document.onkeydown = function (e) {
            if (e.key === "Enter") {
                if (input === q.answer) {
                    score++;
                    showFeedback(true);
                } else showFeedback(false);
                document.onkeydown = null;
                nextQuestion();
            } else if (e.key === "Backspace") {
                input = input.slice(0, -1);
            } else if (e.key.length === 1) {
                input += e.key;
            } else if (e.key === 'Escape') {
                changeScreen('result');
            } else if (e.key === 'ZenkakuHankaku') {
                keyboardtype = keyboardtype === 'hankaku' ? 'zenkaku' : 'hankaku'; 
                showKeyboardType()
            }
            span.textContent = input;
            if (input === q.answer) {
                score++;
                showFeedback(true);
                document.onkeydown = null;
                nextQuestion();
            }
            console.log(e.key);
        };
    }
}

function nextQuestion() {
    currentIndex++;
    if (currentIndex >= numQuestions || currentIndex >= questions.length) {
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        document.getElementById("timeResult").textContent = `クリア時間: ${timeTaken}秒`;
        document.getElementById("scoreResult").textContent = `スコア: ${score} / ${currentIndex}`;
        changeScreen("result");
    } else {
        showQuestion();
    }
}

function showKeyboardType() {
    const keyboard = document.createElement("p");
    if (keyboardtype === 'hankaku') keyboard.textContent = 'Aa';
    else keyboard.textContent = 'あ';
    
    keyboard.style.position = 'absolute';
    keyboard.style.bottom = '1vw';
    keyboard.style.right = '1vw';
    keyboard.style.fontSize = '2vw'
}

function resetGame() {
    changeScreen("home");
}
