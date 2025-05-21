// Supabase ライブラリをインポート
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

document.addEventListener("DOMContentLoaded", () => {
    const headerHeight = document.querySelector("header").offsetHeight;
    const main = document.querySelector("main");
    main.style.marginTop = `calc(${headerHeight}px + 1rem)`;

    /** メニュー作成 */

    // メニューボタンの作成
    const menuButton = document.createElement("button");
    menuButton.id = "menuButton";
    menuButton.innerHTML = "&#9776;"; // ハンバーガーアイコン
    document.body.appendChild(menuButton);

    const closeButton = document.createElement("button");
    closeButton.id = "closeButton";
    closeButton.innerHTML = "&#x2715;";
    document.body.appendChild(closeButton)

    // サイドメニューの作成
    const asideMenu = document.createElement("aside");
    asideMenu.id = "asideMenu";
    asideMenu.innerHTML = '';
    document.body.appendChild(asideMenu);

    // メニューボタンのクリックイベント
    menuButton.addEventListener("click", () => {
        asideMenu.classList.toggle("open");
        menuButton.classList.toggle("open");
        closeButton.classList.toggle("open");
        document.body.classList.add('no-scroll');
        createComment(Math.floor(Math.random() * 4));
    });

    closeButton.addEventListener("click", () => {
        asideMenu.classList.toggle("open");
        menuButton.classList.toggle("open");
        closeButton.classList.toggle("open");
        document.body.classList.remove('no-scroll');
    });

    /** サイトリンク */

    asideMenu.innerHTML = '<h2>サイトマップ</h2>'

    const linkListWrapper = document.createElement("nav");
    const linkList = document.createElement("ul");
    linkList.innerHTML = `
                <li id="memberList">
                    <a href="/two-grade-website/member_list/">
                        <i class="fa-solid fa-clipboard-list"></i>名簿
                    </a>
                </li>
                <li id="test">
                    <a href="/two-grade-website/test/">
                        <i class="fa-solid fa-calendar-days"></i>テスト予定
                    </a>
                </li>
                <li id="tasksA">
                    <a href="/two-grade-website/tasks_a/">
                        <i class="fa-solid fa-list-check"></i>課題(A)
                    </a>
                </li>
                <li id="tasksB">
                    <a href="/two-grade-website/tasks_b/">
                        <i class="fa-solid fa-list-check"></i>課題(B)
                    </a>
                </li>
                <li id="bbs">
                    <a href="/two-grade-website/bbs/">
                        <i class="fa-solid fa-chalkboard"></i>掲示板
                    </a>
                </li>
                <li id="question">
                    <a href="/two-grade-website/question/">
                        <i class="fa-solid fa-circle-question"></i>みとい知恵袋
                    </a>
                </li>
                <li id="requestMusic">
                    <a href="/two-grade-website/request_music/">
                        <i class="fa-solid fa-music"></i>リクエスト曲
                    </a>
                </li>
                <li id="quiz">
                    <a href="/two-grade-website/quiz/">
                        <i class="fa-solid fa-q"></i>ポチ問！
                    </a>
                </li>
    `;

    linkListWrapper.appendChild(linkList);
    asideMenu.appendChild(linkListWrapper);

    asideMenu.appendChild(document.createElement("hr")); // 区切り用
    asideMenu.insertAdjacentHTML("beforeend", `
            <h2>ひとくちコメント</h2>
            <p id="comment"></p>
    `);

    function createComment(random) {
        const beforeNum = localStorage.getItem("comment-random");
        const testItem = localStorage.getItem("test-item");
        const nextTest = localStorage.getItem("next-test");
        const testSubject = localStorage.getItem("test-subject");

        const date = new Date(nextTest);
        const formatDate = date.toISOString().split("T")[0];

        const comment = document.getElementById("comment");

        if (beforeNum == random) {
            random += 2;
        }

        switch (random) {
            default:
                comment.innerHTML = `何も言うことはない。`;
                break;
            case 0:
                comment.innerHTML = `次のテストは${testSubject || '[[リンクは削除されました]]'}で${formatDate || '[[リンクは削除されました]]'}に${testItem || '[[リンクは削除されました]]'}を提出のようです。`;
                break;
            case 1:
            case 2:
                const days = ["日", "月", "火", "水", "木", "金", "土"];
                const today = new Date();
                const weekday = days[today.getDay()];
                let dayComment;
                switch (weekday) {
                    case '日':
                        dayComment = random === 1 ? '今日は楽しんで明日から頑張ろう。' : 'サザエさん症候群。';
                        break;
                    case '月':
                        dayComment = random === 1 ? '今日はサイアクな日だ。' : 'はながさき、ことりがさえずっている';
                        break;
                    case '火':
                        dayComment = random === 1 ? '勉強してる？' : '一番影薄いよね。';
                        break;
                    case '水':
                        dayComment = random === 1 ? '折り返し。あと少し。' : 'あと半分、君はどう過ごすか';
                        break;
                    case '木':
                        dayComment = random === 1 ? 'もう一息！少しの頑張りが休日を。' : '火曜日よりは影が薄くない。';
                        break;
                    case '金':
                        dayComment = random === 1 ? 'フィーバータイム！' : '明日から休日！(わかりきっている)';
                        break;
                    case '土':
                        dayComment = random === 1 ? '休日もこんなの見て偉いね。' : '何やってるんですか？べんkry)';
                        break;
                }
                comment.innerHTML = `${weekday}曜日。${dayComment}`;
                break;
            case 3:
                comment.innerHTML = `たまには<a href="/two-grade-website/bbs/">掲示板</a>も見てみてよ。`;
                break;
            case 4:
                comment.innerHTML = `<a href="/two-grade-website/tasks_a/">課</a><a href="/two-grade-website/tasks_b">題</a>は残ってない？`;
                break;
            case 5:
                comment.innerHTML = `<a href="/two-grade-website/quiz/genre/">問題</a>で復習しない？`;
                break;
        };

        localStorage.setItem("comment-random", random);
    }

    /** お知らせ */

    asideMenu.appendChild(document.createElement("hr")); // 区切り用
    asideMenu.insertAdjacentHTML("beforeend", `
        <h2>お知らせ</h2>
        <h3 id="client-page"></h3>
        <div id="notice-container"></div>
    `);


    // Supabase設定
    const supabaseUrl = "https://mgsbwkidyxmicbacqeeh.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nc2J3a2lkeXhtaWNiYWNxZWVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NDA0MjIsImV4cCI6MjA1NTUxNjQyMn0.fNkFQykD9ezBirtJM_fOB7XEIlGU1ZFoejCgrYObElg";
    const pd = createClient(supabaseUrl, supabaseKey);

    let h1Content = '';

    let query = pd.from('notice').select('id, date, content, page').order('date', { ascending: false });

    // 2つ目のh1タグを取得
    if (document.querySelectorAll('h1')[1]) {
        h1Content = document.querySelectorAll('h1')[1].textContent;
        document.getElementById('client-page').textContent = h1Content;
        query = query.eq('page', h1Content);
    } else {
        document.getElementById('client-page').textContent = '一覧';
    };

    // お知らせを取得して表示
    async function loadNotice() {
        const { data, error } = await query;

        if (error) {
            console.error('エラー:', error);
            return;
        }

        const noticeContainer = document.getElementById('notice-container');
        noticeContainer.innerHTML = ''; // 既存の内容をクリア

        // 日付ごとにグループ化
        const groupedNotices = data.reduce((acc, item) => {
            const date = item.date; // 日付でグループ化
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(item);
            return acc;
        }, {});

        // グループ化したお知らせを表示
        Object.keys(groupedNotices).forEach(date => {
            const dateGroup = groupedNotices[date];
            const noticeGroup = document.createElement('div');
            noticeGroup.classList.add('notice-group');

            const dateHeader = document.createElement('h4');
            dateHeader.textContent = date;
            noticeGroup.appendChild(dateHeader);

            const noticeItem = document.createElement('ul');
            noticeItem.classList.add('notice-item');

            dateGroup.forEach(item => {
                const li = document.createElement("li");
                li.textContent = item.content;
                noticeItem.appendChild(li);
            });

            noticeGroup.appendChild(noticeItem);
            noticeContainer.appendChild(noticeGroup);
        });
    }

    loadNotice();


    const bbs = document.getElementById("bbs");
    const question = document.getElementById("question");
    const quiz = document.getElementById("quiz");

    let subMenu = null;

    // サブメニューの生成関数
    function createSubMenu(event) {
        console.log(event)
        if (subMenu) return;

        let page = event.target.innerText;

        subMenu = document.createElement("ul");
        if (page === '掲示板') {
            subMenu.innerHTML = `
                <li>
                    <a href="/two-grade-website/bbs/new_post/">
                        新規投稿
                    </a>
                </li>
            `;
            bbs.appendChild(subMenu);
        } else if (page === 'みとい知恵袋') {
            subMenu.innerHTML = `
                <li>
                    <a href="/two-grade-website/question/new_question/">
                        新規質問投稿
                    </a>
                </li>
            `;
            question.appendChild(subMenu);
        } else if (page === 'ポチ問！') {
            subMenu.innerHTML = `
                <li>
                    <a href="/two-grade-website/quiz/english/">
                        英語
                    </a>
                </li>
                <li>
                    <a href="/two-grade-website/quiz/math/">
                        数学
                    </a>
                </li>
                <li>
                    <a href="/two-grade-website/quiz/japanese/">
                        国語
                    </a>
                </li>
                <li>
                    <a href="/two-grade-website/quiz/science/">
                        理科
                    </a>
                </li>
                <li>
                    <a href="/two-grade-website/quiz/social_study/">
                        社会
                    </a>
                </li>
                <li>
                    <a href="/two-grade-website/quiz/etc/">
                        その他
                    </a>
                </li>
            `;
            quiz.appendChild(subMenu);
        }
    }

    // サブメニューの削除関数
    function removeSubMenu() {
        if (subMenu) {
            subMenu.remove();
            subMenu = null;
        }
    }

    // 画面幅でPC/スマホを判定
    function isWideScreen() {
        return window.innerWidth >= 428; // スマホかPCかの閾値（必要に応じて調整）
    }

    const pageList = document.querySelectorAll('ul>li')

    // PC: hover イベント
    bbs.addEventListener("mouseover", (event) => {
        if (isWideScreen()) {
            createSubMenu(event);
        }
    });
    bbs.addEventListener("mouseleave", () => {
        if (isWideScreen()) {
            removeSubMenu();
        }
    });

    question.addEventListener("mouseover", (event) => {
        if (isWideScreen()) {
            createSubMenu(event);
        }
    });
    question.addEventListener("mouseleave", () => {
        if (isWideScreen()) {
            removeSubMenu();
        }
    });

    quiz.addEventListener("mouseover", (event) => {
        if (isWideScreen()) {
            createSubMenu(event);
        }
    });
    quiz.addEventListener("mouseleave", () => {
        if (isWideScreen()) {
            removeSubMenu();
        }
    });

    // スマホ: click イベント
    bbs.addEventListener("click", (e) => {
        if (!isWideScreen()) {
            if (subMenu) {
                removeSubMenu();
            } else {
                e.preventDefault();
                createSubMenu(e);
            }
        }
    });

    question.addEventListener("click", (e) => {
        if (!isWideScreen()) {
            if (subMenu) {
                removeSubMenu();
            } else {
                e.preventDefault();
                createSubMenu(e);
            }
        }
    });

    quiz.addEventListener("click", (e) => {
        if (!isWideScreen()) {
            if (subMenu) {
                removeSubMenu();
            } else {
                e.preventDefault();
                createSubMenu(e);
            }
        }
    });


});