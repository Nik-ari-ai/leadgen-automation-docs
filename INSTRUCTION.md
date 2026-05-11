# 📘 Инструкция: как развернуть и опубликовать сайт

Эта инструкция — для тебя, Арина. Здесь по шагам, что делать после распаковки архива, чтобы сайт оказался по адресу:

🌐 **https://nik-ari-ai.github.io/leadgen-automation-docs/**

---

## ✅ Что у тебя уже есть в этом архиве

```
leadgen-automation-docs/
├── .github/workflows/deploy.yml      ← GitHub Actions: автодеплой на Pages
├── .gitignore
├── README.md
├── INSTRUCTION.md                    ← этот файл
└── my-website/                       ← Docusaurus-проект
    ├── docusaurus.config.js          ← уже настроен под твой репо
    ├── sidebars.js
    ├── package.json
    ├── src/css/custom.css
    ├── static/img/                   ← favicon, лого
    ├── docs/                         ← вся документация (8 разделов)
    ├── api_specs/leadgen-api.yml     ← OpenAPI спека
    └── diagrams/
        ├── leadgen.bpmn              ← твой BPMN из Camunda
        └── leadgen-quality.dmn       ⚠️ Минимальный DMN — заменить если есть свой
```

---

## ⚠️ Что можно заменить перед коммитом (необязательно)

### 1. DMN-файл (если у тебя есть свой)

Файл `my-website/diagrams/leadgen-quality.dmn` — рабочая DMN-таблица с 7 правилами. Если у тебя есть свой DMN из Camunda — замени.

### 2. Wireframes (.drawio)

В `docs/05-ui/screens.md` стоят TODO с пометками `screen_1_leads.drawio`, `screen_2_import.drawio`, `screen_3_lead_details.drawio`, `screen_4_deduplication.drawio`. Если у тебя есть .drawio файлы — положи их в `my-website/diagrams/` и подкорректируй ссылки в `screens.md`.

---

## 🚀 Шаг 1. Создать репозиторий на GitHub

1. Зайди на https://github.com/new
2. **Repository name:** `leadgen-automation-docs`
3. **Owner:** `Nik-ari-ai`
4. **Public**
5. **НЕ ставь** галочки на «Add a README», «Add .gitignore», «Add license» — у нас уже всё есть
6. Жми **Create repository**

---

## 💻 Шаг 2. Залить код в репо

Открой терминал в папке `leadgen-automation-docs/` (там, где лежит `README.md` и `INSTRUCTION.md`):

```bash
cd leadgen-automation-docs

git init
git add .
git commit -m "Initial commit: Docusaurus site for LeadGen Automation"
git branch -M main
git remote add origin https://github.com/Nik-ari-ai/leadgen-automation-docs.git
git push -u origin main
```

При первом push GitHub попросит залогиниться. Если используешь HTTPS — введи логин и **Personal Access Token** (его можно создать на https://github.com/settings/tokens).

---

## ⚙️ Шаг 3. Разрешить GitHub Actions писать в репо

GitHub Actions по умолчанию имеет **read-only** доступ. Чтобы он мог запушить собранный сайт в ветку `gh-pages`, нужно разрешить **write**.

1. Открой репо → **Settings** → слева снизу **Actions** → **General**
2. Прокрути до **Workflow permissions**
3. Выбери **Read and write permissions**
4. Жми **Save**

Без этого шага деплой упадёт с ошибкой `403 Permission denied`.

---

## 🏃 Шаг 4. Запустить деплой

После первого `git push` workflow запустится автоматически. Можно посмотреть прогресс:

- Открой репо → вкладка **Actions**
- Увидишь запуск **Deploy to GitHub Pages**
- Дождись зелёной галочки (3–5 минут на первый раз — npm ставит зависимости)

Если упадёт — открой лог job, посмотри ошибку. Чаще всего это:
- забыли Workflow permissions (Шаг 3)
- ошибка в markdown-файле (broken link / неверный frontmatter)

---

## 🌐 Шаг 5. Включить GitHub Pages

После того как первый workflow прошёл успешно, появится ветка `gh-pages` со сборкой. Теперь нужно сказать GitHub: «опубликуй её».

1. Открой репо → **Settings** → слева **Pages**
2. **Source:** Deploy from a branch
3. **Branch:** выбери **`gh-pages`** и папку **`/ (root)`**
4. Жми **Save**

Подожди 1–2 минуты. На той же странице вверху появится:

> Your site is live at **https://nik-ari-ai.github.io/leadgen-automation-docs/**

✅ Готово. Сайт работает.

---

## 🛠️ Шаг 6. Локальный запуск (необязательно)

Чтобы проверить сайт у себя на компьютере перед коммитом:

```bash
cd my-website
npm install      # один раз, ставит зависимости (~2 минуты)
npm start        # запустит сайт на http://localhost:3000/leadgen-automation-docs/
```

При изменениях в `.md` файлах сайт сам перезагружается.

---

## 🔁 Дальнейшие изменения

Любое изменение в `main` автоматически разворачивается на сайте.

```bash
# Поменяла что-то в docs/...
git add .
git commit -m "Поправила NFR-03"
git push

# через 2-3 минуты сайт обновится
```

---

## 🆘 Если что-то не работает

### Build падает с ошибкой PlantUML / broken markdown link
PlantUML рендерится через публичный сервер, иногда долго. Если упало — пушни пустой коммит, перезапустит:
```bash
git commit --allow-empty -m "retry deploy"
git push
```

### `403 Permission denied` в Actions
→ Шаг 3 не сделан. Settings → Actions → General → Workflow permissions = Read and write.

### `404` после деплоя на сайте
→ Шаг 5 не сделан. Settings → Pages → Source = `gh-pages` branch.

### `npm install` локально падает
→ Установи Node.js 18+ (https://nodejs.org/). Проверка: `node --version`.

### Что-то поломалось с PlantUML-диаграммами
PlantUML код встроен прямо в `.md` файлы (внутри ```plantuml блоков). Открой проблемный файл, проверь, что код PlantUML корректный (можно проверить в [онлайн-редакторе](https://www.plantuml.com/plantuml/uml/)).

---

## 📤 Что сдавать преподавателю

После того, как сайт работает — отправь:

1. **Ссылку на репо:** `https://github.com/Nik-ari-ai/leadgen-automation-docs`
2. **Ссылку на сайт:** `https://nik-ari-ai.github.io/leadgen-automation-docs/`

Удачи!
