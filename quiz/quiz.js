// スクリプトタグから値を取得
const scriptTag = document.currentScript;
const genre = scriptTag.getAttribute('data-subject');

let allData;

// クイズデータを取得
fetch(`./${genre}.json`)
    .then((response) => response.json())
    .then((data) => {
        allData = data;
        setupQuizSettings(allData);
    })
    .catch((error) => console.error('クイズデータの読み込みに失敗しました:', error));


// 配列をランダムにシャッフルするユーティリティ関数
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

let restartData;

// ジャンル選択と問題数設定を同じ画面で表示
function setupQuizSettings(quizData) {
    const quizContainer = document.getElementById('quiz-container');
    const genres = quizData.map((quiz) => quiz.genre);

    quizContainer.innerHTML = `
    <h2>クイズの設定</h2>
    <form id="quiz-settings-form">
        <h3>ジャンルを選択してください</h3>
        ${genres
            .map(
                (genre, index) => `
            <label>
                <input type="radio" name="genre" value="${genre}" ${index === 0 ? 'checked' : ''}>
                ${genre}
            </label><br>
        `
            )
            .join('')}
        <h3>質問数を選択してください</h3>
        <label for="question-count">質問数:</label><br>
        <input type="range" id="question-count" min="1" value="1">
        <span id="question-count-display">1</span> 問<br>
        <button type="button" id="start-quiz-button">[enter] クイズを開始</button>
    </form>
`;

    const questionCountInput = document.getElementById('question-count');
    const questionCountDisplay = document.getElementById('question-count-display');
    const startButton = document.getElementById('start-quiz-button');
    const genreRadios = document.querySelectorAll('input[name="genre"]');

    // 初期ジャンルの最大値を設定
    const initialGenre = document.querySelector('input[name="genre"]:checked').value;
    const initialQuizData = quizData.find((quiz) => quiz.genre === initialGenre);
    if (initialQuizData && initialQuizData.list) {
        const maxQuestions = initialQuizData.list.length;
        questionCountInput.max = maxQuestions;
        questionCountInput.value = Math.min(5, maxQuestions); // 初期値を5または最大値に設定
        questionCountDisplay.textContent = questionCountInput.value;
    }

    // 質問数の表示を更新
    questionCountInput.addEventListener('input', () => {
        questionCountDisplay.textContent = questionCountInput.value;
    });

    // ジャンル選択時にスライダーの最大値を更新
    genreRadios.forEach((radio) => {
        radio.addEventListener('change', () => {
            const selectedGenre = document.querySelector('input[name="genre"]:checked').value;
            const selectedQuizData = quizData.find((quiz) => quiz.genre === selectedGenre);

            if (selectedQuizData && selectedQuizData.list) {
                const maxQuestions = selectedQuizData.list.length;
                questionCountInput.max = maxQuestions;

                // スライダーの現在の値が最大値を超えている場合、最大値にリセット
                if (parseInt(questionCountInput.value, 10) > maxQuestions) {
                    questionCountInput.value = maxQuestions;
                }

                questionCountDisplay.textContent = questionCountInput.value;
            }
        });
    });

    function startHundleKeyPress(event) {
        if (event.key === 'Enter') {
            startButton.click();
        }
    }

    // Enterキーでクイズ開始
    document.addEventListener('keydown', startHundleKeyPress);

    // クイズ開始ボタンのクリックイベント
    startButton.addEventListener('click', () => {
        const selectedGenre = document.querySelector('input[name="genre"]:checked').value;
        const selectedQuizData = quizData.find((quiz) => quiz.genre === selectedGenre);

        if (!selectedQuizData || !selectedQuizData.list) {
            console.error('指定されたジャンルのクイズデータが見つかりません');
            return;
        }

        const questionCount = parseInt(questionCountInput.value, 10);
        const shuffledQuizList = shuffleArray([...selectedQuizData.list]); // クイズをランダムにシャッフル
        const limitedQuizData = {
            list: shuffledQuizList.slice(0, questionCount), // 指定された質問数だけ選択
        };

        restartData = limitedQuizData; // 再スタート用のデータを保存

        document.removeEventListener('keydown', startHundleKeyPress); // キーボードイベントを解除
        startQuiz(limitedQuizData);
    });
}

// クイズを開始
function startQuiz(quizData) {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = `
    <div id="question-container">
        <h2 id="question"></h2>
        <div id="options"></div>
        <p id="result"></p>
        <button id="next-button" style="display: none;">次の質問</button>
    </div>
`;

    const questionElement = document.getElementById('question');
    const optionsElement = document.getElementById('options');
    const resultElement = document.getElementById('result');
    const nextButton = document.getElementById('next-button');

    let currentQuestionIndex = 0;
    let score = 0;
    let selectedOptionIndex = null; // 現在選択中の選択肢のインデックス

    function showQuestion() {
        const currentQuestion = quizData.list[currentQuestionIndex];
        questionElement.textContent = currentQuestion.question;
        optionsElement.innerHTML = '';
        selectedOptionIndex = null; // 選択状態をリセット

        const shuffledOptions = [...currentQuestion.options].sort(() => Math.random() - 0.5);
        shuffledOptions.forEach((option, index) => {
            const button = document.createElement('button');
            button.textContent = `${index + 1}: ${option}`; // 選択肢に番号を付ける
            button.classList.add('option-button');
            button.style.padding = '10px 20px';
            button.style.fontSize = '1.5rem';
            button.dataset.index = index; // インデックスをデータ属性に保存
            optionsElement.appendChild(button);

            // ボタンのクリックイベント
            button.addEventListener('click', () => {
                checkAnswer(button, option, currentQuestion.answer);
            });
        });

        // キーボードイベントで選択肢を選ぶ
        document.addEventListener('keydown', handleKeyPress);
    }

    function handleKeyPress(event) {
        const optionButtons = document.querySelectorAll('.option-button');
        if (event.key >= '1' && event.key <= String(optionButtons.length)) {
            // 数字キーで選択肢を選ぶ
            selectedOptionIndex = parseInt(event.key, 10) - 1;
            const selectedButton = optionButtons[selectedOptionIndex];
            const selectedOption = selectedButton.textContent.split(': ')[1];
            const correctAnswer = quizData.list[currentQuestionIndex].answer;
            checkAnswer(selectedButton, selectedOption, correctAnswer);
        } else if (event.key === 'Enter') {
            // Enterキーで次の質問に進む
            if (nextButton.style.display === 'block') {
                nextButton.click(); // 次の質問ボタンをクリック
            }
        }
    }

    function checkAnswer(selectedButton, selectedOption, correctAnswer) {
        document.querySelectorAll('.option-button').forEach((button) => {
            button.disabled = true;
            // ボタンのテキストから番号を除いた選択肢部分を取得
            const buttonOption = button.textContent.split(': ')[1];
            if (buttonOption === correctAnswer) {
                button.style.backgroundColor = '#b64300';
                button.style.color = '#fff';
            }
        });

        resultElement.textContent = selectedOption === correctAnswer
            ? '正解！'
            : `不正解！正解は「${correctAnswer}」です。`;

        if (selectedOption === correctAnswer) score++;
        nextButton.style.display = 'block';

        if (currentQuestionIndex === quizData.list.length - 1) {
            nextButton.textContent = '結果を見る';
        }
    }

    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < quizData.list.length) {
            resultElement.textContent = '';
            nextButton.style.display = 'none';
            showQuestion();
        } else {
            document.removeEventListener('keydown', handleKeyPress); // キーボードイベントを解除

            // クイズ終了時のボタン設定
            quizContainer.innerHTML = `
    <h2>クイズ終了！</h2>
    <p>あなたのスコアは <span style="color: #b64300; font-size:1.5rem;">${score}</span> 
    <span style="font-size:1.2rem;">/ ${quizData.list.length}</span> です。</p>
    <button id="restart-button">[R] もう一度挑戦</button>
    <button id="setting-button">[S] 設定へ戻る</button>
    <button id="back-button">[B] 戻る</button>
    `;

            // スコアに応じて花火を表示
            let confettiInterval;
            if (score === quizData.list.length) {
                const scoreElement = document.querySelector('span[style*="color: #b64300"]');
                if (scoreElement) {
                    const rect = scoreElement.getBoundingClientRect();
                    const origin = {
                        x: (rect.left + rect.width / 2) / window.innerWidth,
                        y: (rect.top + rect.height / 2) / window.innerHeight,
                    };

                    confettiInterval = setInterval(() => {
                        confetti({
                            particleCount: 100,
                            spread: 70,
                            origin: origin,
                        });
                    }, 200);
                    setTimeout(() => {
                        clearInterval(confettiInterval);
                    }, 1000);
                }
            }

            const restartButton = document.getElementById('restart-button');
            const settingButton = document.getElementById('setting-button');
            const backButton = document.getElementById('back-button');

            const handleClick = (button, action) => {
                if (button) {
                    button.addEventListener('click', action);
                }
            };

            handleClick(restartButton, () => startQuiz(restartData));
            handleClick(settingButton, () => setupQuizSettings(allData));
            handleClick(backButton, () => window.location.href = `../genre/`);

            const handleResultKeyPress = (event) => {
                switch (event.key) {
                    case 'r':
                        restartButton?.click();
                        break;
                    case 's':
                        settingButton?.click();
                        break;
                    case 'b':
                        backButton?.click();
                        break;
                }
            };

            document.addEventListener('keydown', handleResultKeyPress);
        }
    });
    showQuestion();
}