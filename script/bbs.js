// Supabase ライブラリから `createClient` をインポート
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://mgsbwkidyxmicbacqeeh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nc2J3a2lkeXhtaWNiYWNxZWVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NDA0MjIsImV4cCI6MjA1NTUxNjQyMn0.fNkFQykD9ezBirtJM_fOB7XEIlGU1ZFoejCgrYObElg";
const supabase = createClient(supabaseUrl, supabaseKey)

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const thread = params.get("thread");
    const listTitle = document.getElementById("listTitle");
    const postList = document.getElementById("postList");
    const threadList = document.getElementById("threadList");
    const headerBreadcrumb = document.querySelector(".header__breadcrumb");

    // スレッド一覧の取得
    const { data: threads, error: threadError } = await supabase
        .from("BBS")
        .select("thread")
        .limit(10)
        .order('created_at', { ascending: false }); 

    if (threadError) {
        console.error("スレッド取得エラー:", threadError);
        return;
    }

    // ユニークなスレッド一覧を取得
    const uniqueThreads = [...new Set(threads.map(t => t.thread))];

    // プルダウンメニューの作成
    threadDropdown.innerHTML += uniqueThreads.map(t =>
        `<option value="${t}" ${thread === t ? "selected" : ""}>${t}</option>`
    ).join("");

    // スレッド選択時にページ遷移
    threadDropdown.addEventListener("change", (event) => {
        const selectedThread = event.target.value;
        if (selectedThread === "all") {
            window.location.href = "bbs.html";
        } else {
            window.location.href = `bbs.html?thread=${encodeURIComponent(selectedThread)}`;
        }
    });

    // スレッドごとの投稿一覧の取得
    let query = supabase.from("BBS").select("*").order("created_at", { ascending: false });
    if (thread) query = query.eq("thread", thread);

    const { data: posts, error: postError } = await query;
    if (postError) {
        console.error("投稿取得エラー:", postError);
        return;
    }

    // `title` が `null` の投稿は表示しない
    postList.innerHTML = posts
        .filter(post => post.title) // `title` が `null` の投稿を除外
        .map(post => `
            <div>
                <h3>${post.title} - ${post.thread}</h3>
                <small>${post.username} - ${new Date(post.created_at).toLocaleString()}</small>
                <p>${post.content}</p>
            </div>
            <hr>
        `)
        .join("");

    // ページのタイトルとパンくずリストの更新
    if (thread) {
        document.title = `${thread} - 掲示板 | R6年度1学年総合ウェブサイト`
        listTitle.textContent = `スレッド: ${thread}`;
        headerBreadcrumb.innerHTML = `<a href="index.html"><i class="fa-solid fa-house"></i>トップページ</a>
            <a href="bbs.html"><i class="fa-solid fa-chalkboard"></i>掲示板</a>
            <a href="bbs.html?thread=${thread}">${thread}`;
    } else {
        document.title = "掲示板 | R6年度1学年総合ウェブサイト"
        listTitle.textContent = "最新の投稿";
        headerBreadcrumb.innerHTML = `<a href="index.html"><i class="fa-solid fa-house"></i>トップページ</a>
            <a href="bbs.html"><i class="fa-solid fa-chalkboard"></i>掲示板</a>`;
    }
});
