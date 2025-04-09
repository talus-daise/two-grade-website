// Supabase ライブラリをインポート
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

document.addEventListener("DOMContentLoaded", () => {
    // メニューボタンの作成
    const menuButton = document.createElement("button");
    menuButton.id = "menuButton";
    menuButton.innerHTML = "&#9776;"; // ハンバーガーアイコン
    document.body.appendChild(menuButton);

    // サイドメニューの作成
    const asideMenu = document.createElement("aside");
    asideMenu.id = "asideMenu";
    asideMenu.innerHTML = `
        <h2>お知らせ</h2>
        <h3 id="client-page"></h3>
        <div id="notice-container"></div>
    `;
    document.body.appendChild(asideMenu);

    // メニューボタンのクリックイベント
    menuButton.addEventListener("click", () => {
        asideMenu.classList.toggle("open");
        menuButton.classList.toggle("open");
    });

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
                noticeItem.innerHTML += `
                    <li>${item.content}</li>
                `;
            });
            
            noticeGroup.appendChild(noticeItem);
            noticeContainer.appendChild(noticeGroup);
        });
    }

    window.onload = loadNotice;
});
