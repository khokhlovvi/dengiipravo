"""Заметка-документ из хранилища -> Word на бланке «Деньги & Право» с логотипом сайта.

Запуск: python make_docx.py <заметка.md> <dip.png> <выход.docx>  (рядом со скриптом — rapidatech.png)
Бланк — поле `blank` во frontmatter: dip (по умолчанию) или rapidatech (в подвале — «Деньги & Право» как партнёр).
Нужен python-docx (есть в ~/automations/dip-bot/.venv на сервере).
Понимает: # заголовок, абзац сразу под ним (подзаголовок), ## разделы, списки «- »,
таблицы «|», **жирный**, ==выделение== (жёлтым — места, которые нужно дописать).
Всё после «## Служебное» в документ не попадает.
"""
import re, sys
from datetime import date
from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_COLOR_INDEX
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Mm, Pt, RGBColor

NAVY, INK, GREY, LINE = RGBColor(0x08, 0x2E, 0x50), RGBColor(0x0F, 0x13, 0x18), RGBColor(0x5B, 0x64, 0x70), "C9D3DD"
FONT = "Arial"
SITE, PHONE, EMAIL = "dengiipravo.ru", "8 (926) 860-49-29", "dengi_i_pravo@mail.ru"

note, logo, out = sys.argv[1:4]
text = open(note, encoding="utf-8").read()
fm = {}
if text.startswith("---"):
    head, text = text[3:].split("\n---", 1)
    for line in head.strip().splitlines():
        if ":" in line:
            k, v = line.split(":", 1); fm[k.strip()] = v.strip().strip('"')
text = text.split("\n## Служебное")[0].strip("\n")


def set_cell_bg(cell, hex_):
    pr = cell._tc.get_or_add_tcPr(); sh = OxmlElement("w:shd")
    sh.set(qn("w:val"), "clear"); sh.set(qn("w:color"), "auto"); sh.set(qn("w:fill"), hex_); pr.append(sh)


def borders(table, color=None, inside=True):
    tblPr = table._tbl.tblPr; b = OxmlElement("w:tblBorders")
    for side in ("top", "left", "bottom", "right", "insideH", "insideV"):
        e = OxmlElement(f"w:{side}")
        on = color and (side in ("top", "bottom", "insideH") if inside else False)
        e.set(qn("w:val"), "single" if on else "nil")
        if on: e.set(qn("w:sz"), "4"); e.set(qn("w:color"), color)
        b.append(e)
    tblPr.append(b)


def cell_margins(table, top=60, bottom=60, left=100, right=100):
    m = OxmlElement("w:tblCellMar")
    for side, v in (("top", top), ("left", left), ("bottom", bottom), ("right", right)):
        e = OxmlElement(f"w:{side}"); e.set(qn("w:w"), str(v)); e.set(qn("w:type"), "dxa"); m.append(e)
    table._tbl.tblPr.append(m)


def widths(table, ws):
    table.autofit = False
    pr = table._tbl.tblPr
    lay = OxmlElement("w:tblLayout"); lay.set(qn("w:type"), "fixed"); pr.append(lay)
    tw = pr.find(qn("w:tblW"))
    if tw is None: tw = OxmlElement("w:tblW"); pr.append(tw)
    tw.set(qn("w:type"), "dxa"); tw.set(qn("w:w"), str(int(sum(w for w in ws) / 635)))
    for i, w in enumerate(ws):
        table.columns[i].width = w
        for c in table.columns[i].cells: c.width = w


def para_border_bottom(p, color="082E50", sz=8):
    pPr = p._p.get_or_add_pPr(); bdr = OxmlElement("w:pBdr"); bt = OxmlElement("w:bottom")
    bt.set(qn("w:val"), "single"); bt.set(qn("w:sz"), str(sz)); bt.set(qn("w:space"), "6"); bt.set(qn("w:color"), color)
    bdr.append(bt); pPr.append(bdr)


def runs(p, s, size=None, color=None, bold=False):
    s = re.sub(r"\[\[([^\]|]+\|)?([^\]]+)\]\]", r"\2", s)
    for part in re.split(r"(\*\*.+?\*\*|==.+?==)", s):
        if not part: continue
        b, hl = bold, False
        if part.startswith("**") and part.endswith("**"): part, b = part[2:-2], True
        if part.startswith("==") and part.endswith("=="):
            part, hl = part[2:-2], True
            if part.startswith("**") and part.endswith("**"): part, b = part[2:-2], True
        for sub in re.split(r"(\*\*.+?\*\*)", part):
            if not sub: continue
            bb = b
            if sub.startswith("**") and sub.endswith("**"): sub, bb = sub[2:-2], True
            r = p.add_run(sub); r.bold = bb
            if size: r.font.size = Pt(size)
            if color is not None: r.font.color.rgb = color
            if hl: r.font.highlight_color = WD_COLOR_INDEX.YELLOW
    return p


doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Mm(210), Mm(297)
sec.left_margin, sec.right_margin, sec.top_margin, sec.bottom_margin = Mm(22), Mm(18), Mm(16), Mm(18)
sec.header_distance, sec.footer_distance = Mm(9), Mm(9)
st = doc.styles["Normal"]; st.font.name = FONT; st.font.size = Pt(11); st.font.color.rgb = INK
st.element.rPr.rFonts.set(qn("w:eastAsia"), FONT)
st.paragraph_format.space_after = Pt(6); st.paragraph_format.line_spacing = 1.2
for name in ("List Bullet",):
    doc.styles[name].font.name = FONT; doc.styles[name].font.size = Pt(11)

# Бланки: основной бренд в шапке, партнёр (если есть) — мелко в подвале
HERE = __import__("os").path.dirname(__file__) or "."
BRANDS = {
    "dip": dict(mark="dip.png", name="Деньги & Право", italic=False, color=NAVY,
                tagline="Финансовые инструменты и правовая работа", right=(SITE, PHONE, EMAIL)),
    "rapidatech": dict(mark="rapidatech.png", name="РапидаТех", italic=True, color=RGBColor(0x0E, 0x2A, 0x5E),
                       tagline="Научно-инжиниринговая компания · Наука, технологии, производство",
                       right=("ООО «РапидаТех»", "ИНН 1683028089 · ОГРН 1251600028459", "Республика Татарстан")),
}
blank = fm.get("blank", "dip")
brand = BRANDS[blank]; partner = BRANDS["dip"] if blank != "dip" else None
img = lambda n: n if n.startswith("/") else __import__("os").path.join(HERE, n)

hdr = sec.header; hp = hdr.paragraphs[0]
t = hdr.add_table(rows=1, cols=3, width=Mm(170)); borders(t); cell_margins(t, 0, 0, 0, 0)
t.alignment = WD_TABLE_ALIGNMENT.LEFT
c0, c1, c2 = t.rows[0].cells
c0.paragraphs[0].add_run().add_picture(img(brand["mark"]) if blank != "dip" else logo, width=Mm(13))
p = c1.paragraphs[0]; p.paragraph_format.space_after = Pt(0); p.paragraph_format.space_before = Pt(3)
r = p.add_run(brand["name"]); r.bold = True; r.italic = brand["italic"]; r.font.size = Pt(17); r.font.color.rgb = brand["color"]
p = c1.add_paragraph(); p.paragraph_format.space_after = Pt(0)
r = p.add_run(brand["tagline"]); r.font.size = Pt(8.5); r.font.color.rgb = GREY
for i, line in enumerate(brand["right"]):
    p = c2.paragraphs[0] if i == 0 else c2.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT; p.paragraph_format.space_after = Pt(0); p.paragraph_format.line_spacing = 1.1
    r = p.add_run(line); r.font.size = Pt(8.5); r.font.color.rgb = GREY
widths(t, (Mm(17), Mm(93), Mm(60)))
hdr._element.remove(hp._p)
line = hdr.add_paragraph(); para_border_bottom(line, color="%02X%02X%02X" % tuple(brand["color"])); line.paragraph_format.space_after = Pt(0)
line.paragraph_format.line_spacing = Pt(2)

# Подвал: партнёр проекта слева, номер страницы справа
ft = sec.footer; fp0 = ft.paragraphs[0]
t = ft.add_table(rows=1, cols=2, width=Mm(170)); borders(t); cell_margins(t, 0, 0, 0, 0)
fa, fb = t.rows[0].cells
if partner:
    p = fa.paragraphs[0]
    p.add_run().add_picture(logo, width=Mm(4.2))
    r = p.add_run("  Партнёр проекта — «Деньги & Право» · " + SITE); r.font.size = Pt(7.5); r.font.color.rgb = GREY
fp = fb.paragraphs[0]; fp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
r = fp.add_run(); r.font.size = Pt(8.5); r.font.color.rgb = GREY
for kind, val in (("begin", None), ("instr", "PAGE"), ("end", None)):
    if kind == "instr":
        e = OxmlElement("w:instrText"); e.set(qn("xml:space"), "preserve"); e.text = val
    else:
        e = OxmlElement("w:fldChar"); e.set(qn("w:fldCharType"), kind)
    r._r.append(e)
widths(t, (Mm(140), Mm(30)))
ft._element.remove(fp0._p)

# Дата, номер и адресат
d = fm.get("date") or date.today().isoformat()
y, m, dd = d.split("-")
num = fm.get("number") or "____"
t = doc.add_table(rows=1, cols=2); borders(t); cell_margins(t, 0, 0, 0, 0)
a, b = t.rows[0].cells
p = a.paragraphs[0]; runs(p, f"{dd}.{m}.{y}  ·  Исх. № {num}", size=9.5, color=GREY)
to = [s.strip() for s in fm.get("to", "").split(" / ") if s.strip()]
for i, s in enumerate(to):
    p = b.paragraphs[0] if i == 0 else b.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT; p.paragraph_format.space_after = Pt(0)
    runs(p, s, size=10.5, bold=(i == 0))
widths(t, (Mm(70), Mm(100)))
doc.add_paragraph().paragraph_format.space_after = Pt(4)

lines = text.splitlines(); i = 0; after_title = False
while i < len(lines):
    s = lines[i].rstrip()
    if not s.strip():
        i += 1; continue
    if s.startswith("# "):
        p = doc.add_paragraph(); p.paragraph_format.space_after = Pt(4); p.paragraph_format.line_spacing = 1.1
        runs(p, s[2:], size=17, color=NAVY, bold=True); after_title = True; i += 1; continue
    if after_title and not s.startswith(("#", "-", "|")):
        p = doc.add_paragraph(); p.paragraph_format.space_after = Pt(16)
        runs(p, s, size=11.5, color=GREY); after_title = False; i += 1; continue
    after_title = False
    if s.startswith("## "):
        p = doc.add_paragraph(); p.paragraph_format.space_before = Pt(12); p.paragraph_format.space_after = Pt(5)
        p.paragraph_format.keep_with_next = True
        runs(p, s[3:], size=13, color=NAVY, bold=True); i += 1; continue
    if s.startswith("- "):
        p = doc.add_paragraph(style="List Bullet"); p.paragraph_format.space_after = Pt(3)
        runs(p, s[2:]); i += 1; continue
    if s.startswith("|"):
        rows = []
        while i < len(lines) and lines[i].startswith("|"):
            cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
            if not all(re.fullmatch(r":?-{2,}:?", c) for c in cells): rows.append(cells)
            i += 1
        header = rows[0] if any(rows[0]) else None
        body = rows[1:]
        tab = doc.add_table(rows=0, cols=len(rows[0])); borders(tab, LINE); cell_margins(tab)
        w1 = Mm(50) if not header else Mm(22)
        def add(cells, head=False):
            rc = tab.add_row().cells
            for j, c in enumerate(cells):
                p = rc[j].paragraphs[0]; p.paragraph_format.space_after = Pt(0); p.paragraph_format.line_spacing = 1.15
                if head:
                    set_cell_bg(rc[j], "082E50"); runs(p, c, size=9.5, color=RGBColor(255, 255, 255), bold=True)
                elif j == 0:
                    runs(p, c, size=10, color=GREY if not header else INK, bold=bool(header))
                else:
                    runs(p, c, size=10)
        if header: add(header, head=True)
        for r_ in body: add(r_)
        widths(tab, (w1, Mm(170) - w1))
        doc.add_paragraph().paragraph_format.space_after = Pt(2)
        continue
    p = doc.add_paragraph()
    if s.startswith("С уважением") or s.startswith("Приложение"):
        p.paragraph_format.space_before = Pt(10)
    runs(p, s, size=9.5 if s.startswith("Приложение") else None, color=GREY if s.startswith("Приложение") else None)
    i += 1

doc.core_properties.author = brand["name"]
doc.core_properties.title = re.search(r"^# (.+)$", text, re.M).group(1)
doc.save(out)
print("ok", out)
