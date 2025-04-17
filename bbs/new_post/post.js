// Supabase ライブラリから `createClient` をインポート
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://mgsbwkidyxmicbacqeeh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nc2J3a2lkeXhtaWNiYWNxZWVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NDA0MjIsImV4cCI6MjA1NTUxNjQyMn0.fNkFQykD9ezBirtJM_fOB7XEIlGU1ZFoejCgrYObElg";
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", async () => {
    const threadSelect = document.getElementById("thread");
    const threadList = document.getElementById("threadList");

    // スレッド一覧の取得
    const { data: threads, error: threadError } = await supabase
        .from("BBS")
        .select("thread")
        .order("thread", { ascending: true });

    if (threadError) {
        console.error("スレッド取得エラー:", threadError);
        return;
    }

    // ユニークなスレッド一覧を作成
    const uniqueThreads = [...new Set(threads.map(t => t.thread))];

    // セレクトボックスにスレッドを追加
    uniqueThreads.forEach(t => {
        const option = document.createElement("option");
        option.value = t;
        option.textContent = t;
        threadSelect.appendChild(option);
    });

    // スレッド一覧を表示
    threadList.innerHTML = uniqueThreads.map(t => 
        `<li>${t}</li>`
    ).join("");
});

document.getElementById("postForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const thread = document.getElementById("thread").value;
    const username = document.getElementById("username").value;
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;

    if (!thread) {
        showCustomAlert("スレッドを選択してください！");
        return;
    }

    const { error } = await supabase.from("BBS").insert([{ thread, username, title, content }]);
    if (error) {
        console.error("投稿エラー:", error);
        return;
    }

    showCustomAlert("投稿完了！");
    window.location.href = `../?thread=${thread}`;
});

window.addEventListener('beforeunload', function (event) {
    event.preventDefault() // (1)
    event.returnValue = '' // (2)
  })
  