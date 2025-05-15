// Supabase ライブラリをインポート
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

document.addEventListener("DOMContentLoaded", () => {
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
    });

    closeButton.addEventListener("click", () => {
        asideMenu.classList.toggle("open");
        menuButton.classList.toggle("open");
        closeButton.classList.toggle("open");
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
    const requestMusic = document.getElementById("requestMusic");
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
        } else if (page === 'みとい知恵袋') {
            subMenu.innerHTML = `
                <li>
                    <a href="/two-grade-website/question/new_question/">
                        新規質問投稿
                    </a>
                </li>
            `;
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
        }

        subMenu.classList.add("bbs-submenu"); // スタイル用クラス
        bbs.appendChild(subMenu); // linkListWrapper ではなく bbs に追加
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
});