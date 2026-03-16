/** @typedef {{ text: string, next?: string, href?: string, primary?: boolean }} Option */
/** @typedef {{ botText: string, options: Option[] }} Node */
/** @typedef {{ start: string, nodes: Record<string, Node> }} Scenario */

/** @type {Scenario} */
const SCENARIO = {
  start: "step1",
  nodes: {
    step1: {
      botText: "こんにちは！いま花粉症で鼻水大洪水です！依頼受付ページです。ご用件を選んでください。",
      options: [
        { text: "依頼をしたい", next: "step2a" },
        { text: "まだ検討中", next: "step2b" },
      ],
    },
    step2a: {
      botText: "依頼内容のタイプを選んでください。",
      options: [
        { text: "簡単な依頼", next: "step3" },
        { text: "しっかりした依頼", next: "step3" },
      ],
    },
    step2b: {
      botText: "お気軽にどうぞ！まずはポートフォリオを見てみますか？",
      options: [
        { text: "ポートフォリオを見る", next: "step3" },
        { text: "やっぱり依頼したい", next: "step2a" },
      ],
    },
    step3: {
      botText: "ありがとうございます。依頼フォームはこちらです。",
      options: [
        {
          text: "依頼フォームを開く",
          href: "https://example.com/request",
          primary: true,
        },
      ],
    },
  },
};

const UI = {
  chatLog: /** @type {HTMLDivElement} */ (document.getElementById("chatLog")),
  choices: /** @type {HTMLDivElement} */ (document.getElementById("choices")),
};

const CONFIG = {
  botDelayMs: 500,
  userEchoDelayMs: 120,
};

/**
 * Bot用アバター要素を生成
 */
function createBotAvatar() {
  const avatar = document.createElement("div");
  avatar.className = "avatar avatar--bot";
  const img = document.createElement("img");
  img.src = "./tanbo.png";
  img.alt = "Bot アイコン";
  avatar.appendChild(img);
  return avatar;
}

/**
 * @param {"bot" | "user"} who
 * @param {string} text
 */
function appendMessage(who, text) {
  const row = document.createElement("div");
  row.className = `row row--${who}`;

  if (who === "bot") {
    const avatar = createBotAvatar();
    row.appendChild(avatar);
  }

  const bubble = document.createElement("div");
  bubble.className = `bubble bubble--${who}`;
  bubble.textContent = text;

  row.appendChild(bubble);
  UI.chatLog.appendChild(row);
  scrollToBottom();
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    UI.chatLog.scrollTo({ top: UI.chatLog.scrollHeight, behavior: "smooth" });
  });
}

/**
 * @param {Scenario} scenario
 * @param {string} nodeId
 */
async function showNode(scenario, nodeId) {
  const node = scenario.nodes[nodeId];
  if (!node) {
    appendMessage("bot", "シナリオの読み込みに失敗しました。");
    UI.choices.replaceChildren();
    return;
  }

  UI.choices.replaceChildren();

  await wait(CONFIG.botDelayMs);
  appendMessage("bot", node.botText);

  await wait(120);
  renderOptions(scenario, node.options);
}

/**
 * @param {Scenario} scenario
 * @param {Option[]} options
 */
function renderOptions(scenario, options) {
  UI.choices.replaceChildren();

  options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = opt.primary ? "choiceBtn choiceBtn--primary" : "choiceBtn";
    btn.textContent = opt.text;

    btn.addEventListener("click", async () => {
      UI.choices.replaceChildren();
      await wait(CONFIG.userEchoDelayMs);
      appendMessage("user", opt.text);

      if (opt.href) {
        // 最終ステップ用：フォームボタンはリンクとして表示
        await wait(CONFIG.botDelayMs);
        const row = document.createElement("div");
        row.className = "row row--bot";

        const avatar = createBotAvatar();
        row.appendChild(avatar);

        const a = document.createElement("a");
        a.className = "choiceBtn choiceBtn--primary";
        a.href = opt.href;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = opt.text;

        row.appendChild(a);
        UI.chatLog.appendChild(row);
        scrollToBottom();
        return;
      }

      if (opt.next) {
        await showNode(scenario, opt.next);
      }
    });

    UI.choices.appendChild(btn);
  });
}

/**
 * @param {number} ms
 */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  UI.chatLog.replaceChildren();
  UI.choices.replaceChildren();

  await wait(250);
  await showNode(SCENARIO, SCENARIO.start);
}

main();
