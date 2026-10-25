/* Неразрывные пробелы на всех страницах: короткие предлоги, союзы и частицы не остаются
   в конце строки. Правило — .claude/skills/design-review/SKILL.md, раздел 6, «Висячие предлоги»
   (по Мильчину). Работает по текстовым узлам, атрибуты (alt, aria-label) не трогает.
   Повторный проход ничего не меняет. Тексты, которые скрипты добавляют позже (подпись
   в лайтбоксе, раздел «Решение»), обрабатывает MutationObserver.
   Подключать первым из скриптов в конце <body> — до edge-title.js, который режет заголовок на буквы. */
(() => {
  const NB = " ";
  const SP = "[ \\t\\n\\r]+"; // обычные пробелы; неразрывный не трогаем — отсюда идемпотентность
  const NOT_LETTER = "(?<![\\p{L}\\p{N}\\-])";
  const END = "(?![\\p{L}\\p{N}])";
  // после слов из 1–3 букв (список из правила), любой регистр, в т. ч. после « ( „ и в начале
  const SHORT = "в|к|с|у|о|а|и|я|во|до|за|из|ко|на|не|ни|но|об|от|по|со|без|для|над|под|при|про|что|как|или";
  // единицы после числа
  const UNITS = [
    "₽", "\\$", "€", "%", "‰", "руб\\.", "р\\.", "тыс\\.", "млн", "млрд",
    "г\\.", "гг\\.", "год", "года", "лет",
    "км", "м", "см", "мм", "кг", "мин", "ч", "сек", "с",
    "день", "дня", "дней", "дн\\.", "неделя", "недели", "недель", "мес\\.", "месяц", "месяца", "месяцев",
    "шт\\.", "чел\\.", "человек", "раз", "балл", "балла", "баллов", "из",
    "январь", "января", "февраль", "февраля", "март", "марта", "апрель", "апреля", "май", "мая",
    "июнь", "июня", "июль", "июля", "август", "августа", "сентябрь", "сентября", "октябрь", "октября",
    "ноябрь", "ноября", "декабрь", "декабря", "янв\\.", "фев\\.", "мар\\.", "апр\\.", "июн\\.", "июл\\.",
    "авг\\.", "сен\\.", "сент\\.", "окт\\.", "нояб\\.", "дек\\."
  ].join("|");
  const RULES = [
    // предлог/союз/частица + пробел → неразрывный
    [new RegExp(NOT_LETTER + "(" + SHORT + ")" + SP, "giu"), "$1" + NB],
    // пробел перед бы, ли, же
    [new RegExp(SP + "(?=(?:бы|ли|же)" + END + ")", "giu"), NB],
    // пробел перед тире и перед точкой-разделителем — они не начинают строку
    [new RegExp(SP + "(?=[—·])", "gu"), NB],
    // разряды числа: 2 405, 124 941
    [new RegExp("(\\d)" + SP + "(?=\\d{3}(?!\\d))", "gu"), "$1" + NB],
    // число + единица, ₽, %, месяц, «г.»
    [new RegExp("(\\d)" + SP + "(?=(?:" + UNITS + ")(?![\\p{L}]))", "giu"), "$1" + NB],
    // № 5, § 3
    [new RegExp("([№§])" + SP + "(?=\\d)", "gu"), "$1" + NB],
    // т. д., т. е., т. п.
    [new RegExp(NOT_LETTER + "(т\\.)" + SP + "(?=[дпе]\\.)", "giu"), "$1" + NB],
    // инициалы и фамилия: А. С. Пушкин
    [new RegExp(NOT_LETTER + "([А-ЯЁA-Z]\\.)" + SP + "(?=[А-ЯЁA-Z]\\.|[А-ЯЁA-Z][а-яёa-z]{2,})", "gu"), "$1" + NB]
  ];
  const fix = (s) => RULES.reduce((t, [re, to]) => t.replace(re, to), s);

  const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "CODE", "PRE", "TEXTAREA", "INPUT", "SELECT", "OPTION", "KBD", "SAMP"]);
  const skipped = (el) => {
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      if (SKIP.has(n.tagName) || n.namespaceURI === "http://www.w3.org/2000/svg" || n.hasAttribute("data-no-typo") || n.isContentEditable) return true;
    }
    return false;
  };
  const fixNode = (t) => {
    const v = t.nodeValue;
    if (!v || !/[ \t\n\r]/.test(v) || skipped(t.parentElement)) return;
    const nv = fix(v);
    if (nv !== v) t.nodeValue = nv;
  };
  const walk = (root) => {
    if (root.nodeType === 3) { fixNode(root); return; }
    if (root.nodeType !== 1 || skipped(root)) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) fixNode(n);
  };

  walk(document.body);
  window.typoNbsp = walk;
  new MutationObserver((list) => {
    list.forEach((m) => {
      if (m.type === "characterData") fixNode(m.target);
      else m.addedNodes.forEach(walk);
    });
  }).observe(document.body, { subtree: true, childList: true, characterData: true });
})();
