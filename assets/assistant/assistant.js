(function () {
  const siteIndex = Array.isArray(window.MENG_SITE_INDEX) ? window.MENG_SITE_INDEX : [];
  const maxTurns = 8;
  const maxInputLength = 120;
  let turns = 0;

  if (!document.body) {
    return;
  }

  const root = document.createElement("section");
  root.className = "site-assistant";
  root.innerHTML = `
    <button class="site-assistant__toggle" type="button" aria-expanded="false" aria-controls="site-assistant-panel">
      <span class="site-assistant__toggle-mark" aria-hidden="true">AI</span>
      <span>小助手</span>
    </button>
    <div class="site-assistant__panel" id="site-assistant-panel" aria-hidden="true">
      <div class="site-assistant__header">
        <div>
          <p>本站小助手</p>
          <h2>问问这里写过什么</h2>
        </div>
        <button class="site-assistant__close" type="button" aria-label="关闭小助手">×</button>
      </div>
      <div class="site-assistant__messages" role="log" aria-live="polite"></div>
      <div class="site-assistant__quick" aria-label="快捷问题">
        <button type="button" data-question="本站有哪些内容？">本站内容</button>
        <button type="button" data-question="帮我找写作练习">写作练习</button>
        <button type="button" data-question="技术分享有什么？">技术分享</button>
      </div>
      <form class="site-assistant__form">
        <label class="visually-hidden" for="site-assistant-input">向小助手提问</label>
        <input id="site-assistant-input" name="question" type="text" maxlength="${maxInputLength}" autocomplete="off" placeholder="问问本站内容...">
        <button type="submit">发送</button>
      </form>
    </div>
  `;

  document.body.appendChild(root);

  const toggle = root.querySelector(".site-assistant__toggle");
  const panel = root.querySelector(".site-assistant__panel");
  const closeButton = root.querySelector(".site-assistant__close");
  const messages = root.querySelector(".site-assistant__messages");
  const form = root.querySelector(".site-assistant__form");
  const input = root.querySelector("#site-assistant-input");
  const quickButtons = root.querySelectorAll("[data-question]");

  addAssistantMessage({
    intro: "你好，我会先查本站资料，再给你一个简短回答。",
    matches: []
  });

  toggle.addEventListener("click", () => {
    setOpen(!root.classList.contains("is-open"));
  });

  closeButton.addEventListener("click", () => {
    setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && root.classList.contains("is-open")) {
      setOpen(false);
    }
  });

  quickButtons.forEach((button) => {
    button.addEventListener("click", () => {
      submitQuestion(button.dataset.question || "");
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitQuestion(input.value);
  });

  function setOpen(isOpen) {
    root.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    panel.setAttribute("aria-hidden", String(!isOpen));

    if (isOpen) {
      window.setTimeout(() => input.focus(), 60);
    }
  }

  function submitQuestion(rawQuestion) {
    const question = rawQuestion.trim();

    if (!question) {
      return;
    }

    if (turns >= maxTurns) {
      addAssistantMessage({
        intro: "这版小助手先聊到这里啦。刷新页面后可以重新开始。",
        matches: []
      });
      input.value = "";
      return;
    }

    turns += 1;
    addUserMessage(question);
    addAssistantMessage(buildAnswer(question));
    input.value = "";

    if (turns >= maxTurns) {
      input.disabled = true;
      form.querySelector("button").disabled = true;
      input.placeholder = "本轮聊天已结束";
    }
  }

  function buildAnswer(question) {
    if (!siteIndex.length) {
      return {
        intro: "我还没有读到本站资料库，暂时不能回答。",
        matches: []
      };
    }

    if (isGreeting(question)) {
      return {
        intro: "我在。你可以问本站的技术笔记、言语分享、写作练习或沟通记录。",
        matches: []
      };
    }

    if (isAboutAssistant(question)) {
      return {
        intro: "我是一个轻量版站内小助手，只根据这个网站整理好的资料库做检索和简短回答。",
        matches: []
      };
    }

    const matches = searchSite(question).slice(0, 3);

    if (!matches.length) {
      return {
        intro: "我在本站资料里没找到很贴合的内容。可以换个关键词，比如“写作”“GitHub CLI”“沟通”或“Codex”。",
        matches: []
      };
    }

    return {
      intro: `我在本站资料里找到 ${matches.length} 个相关内容：`,
      matches
    };
  }

  function searchSite(question) {
    const tokens = tokenize(question);
    const compactQuestion = normalize(question);

    return siteIndex
      .map((entry) => {
        const title = normalize(entry.title);
        const section = normalize(entry.section);
        const tags = (entry.tags || []).map(normalize);
        const summary = normalize(entry.summary);
        const content = normalize(entry.content);
        const haystack = [title, section, ...tags, summary, content].join("");
        let score = 0;

        if (haystack.includes(compactQuestion)) {
          score += 18;
        }

        if (title && compactQuestion.includes(title)) {
          score += 16;
        }

        tags.forEach((tag) => {
          if (!tag) {
            return;
          }

          if (compactQuestion.includes(tag)) {
            score += 12;
          } else if (tag.includes(compactQuestion) && compactQuestion.length >= 2) {
            score += 8;
          }
        });

        tokens.forEach((token) => {
          if (title.includes(token)) {
            score += 8;
          }

          if (tags.some((tag) => tag.includes(token))) {
            score += 6;
          }

          if (section.includes(token)) {
            score += 5;
          }

          if (summary.includes(token)) {
            score += 4;
          }

          if (content.includes(token)) {
            score += 2;
          }
        });

        return {
          ...entry,
          score
        };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  function tokenize(text) {
    const tokens = new Set();
    const lower = text.toLowerCase();
    const latinWords = lower.match(/[a-z0-9]+/g) || [];
    const chineseBlocks = lower.match(/[\u4e00-\u9fa5]+/g) || [];

    latinWords.forEach((word) => {
      if (word.length >= 2) {
        tokens.add(word);
      }
    });

    chineseBlocks.forEach((block) => {
      if (block.length <= 8 && block.length >= 2) {
        tokens.add(block);
      }

      [2, 3, 4].forEach((size) => {
        if (block.length < size) {
          return;
        }

        for (let index = 0; index <= block.length - size; index += 1) {
          tokens.add(block.slice(index, index + size));
        }
      });
    });

    return Array.from(tokens);
  }

  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[，。！？、；：“”‘’（）【】《》,.!?;:"'()[\]<>]/g, "");
  }

  function isGreeting(text) {
    return /^(你好|嗨|hi|hello|在吗|哈喽)/i.test(text.trim());
  }

  function isAboutAssistant(text) {
    return /你是谁|能做什么|小助手|ai|AI|机器人/.test(text);
  }

  function addUserMessage(text) {
    const item = document.createElement("div");
    item.className = "site-assistant__message site-assistant__message--user";
    item.textContent = text;
    messages.appendChild(item);
    scrollMessages();
  }

  function addAssistantMessage(answer) {
    const item = document.createElement("div");
    item.className = "site-assistant__message site-assistant__message--assistant";

    const intro = document.createElement("p");
    intro.textContent = answer.intro;
    item.appendChild(intro);

    if (answer.matches && answer.matches.length) {
      const list = document.createElement("ol");
      list.className = "site-assistant__results";

      answer.matches.forEach((match) => {
        const result = document.createElement("li");
        const link = document.createElement("a");
        const summary = document.createElement("p");
        const meta = document.createElement("span");

        link.href = match.url;
        link.textContent = match.title;
        summary.textContent = match.summary;
        meta.textContent = match.section;

        result.appendChild(link);
        result.appendChild(summary);
        result.appendChild(meta);
        list.appendChild(result);
      });

      item.appendChild(list);
    }

    messages.appendChild(item);
    scrollMessages();
  }

  function scrollMessages() {
    messages.scrollTop = messages.scrollHeight;
  }
})();
