from __future__ import annotations

import html
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    BaseDocTemplate, Frame, Image, KeepTogether, LongTable, PageBreak,
    PageTemplate, Paragraph, Spacer, TableStyle
)

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "docs" / "Clubly-Campus-One-Developer-Guide.md"
OUTPUT = ROOT / "docs" / "Clubly-Campus-One-Developer-Guide.pdf"

NAVY = colors.HexColor("#071b3a")
BLUE = colors.HexColor("#174ea6")
GOLD = colors.HexColor("#f6c945")
PALE_BLUE = colors.HexColor("#edf4ff")
PALE_GOLD = colors.HexColor("#fff7df")
INK = colors.HexColor("#172033")
MUTED = colors.HexColor("#566176")
RULE = colors.HexColor("#d9e1ee")


def inline(text: str) -> str:
    text = html.escape(text)
    text = re.sub(r"`([^`]+)`", r"<font name='Courier' color='#174ea6'>\1</font>", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"\*([^*]+)\*", r"<i>\1</i>", text)
    return text


def cell_paragraph(text: str, style: ParagraphStyle) -> Paragraph:
    return Paragraph(inline(text.strip()), style)


class GuideDoc(BaseDocTemplate):
    def __init__(self, filename: str):
        super().__init__(filename, pagesize=A4, leftMargin=1.55*cm, rightMargin=1.55*cm, topMargin=1.6*cm, bottomMargin=1.55*cm)
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="body")
        self.addPageTemplates(PageTemplate(id="Guide", frames=[frame], onPage=self.draw_header_footer))
        self._heading_count = 0
        self._outline_level = -1

    def draw_header_footer(self, canvas, doc):
        canvas.saveState()
        canvas.setStrokeColor(RULE)
        canvas.setLineWidth(.5)
        canvas.line(self.leftMargin, A4[1]-1.02*cm, A4[0]-self.rightMargin, A4[1]-1.02*cm)
        canvas.setFont("Helvetica-Bold", 8)
        canvas.setFillColor(NAVY)
        canvas.drawString(self.leftMargin, A4[1]-.72*cm, "CLUBLY / CAMPUS ONE DEVELOPER GUIDE")
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(MUTED)
        canvas.drawRightString(A4[0]-self.rightMargin, .72*cm, f"Page {doc.page}")
        canvas.restoreState()

    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph) and getattr(flowable, "bookmark_name", None):
            key = flowable.bookmark_name
            self.canv.bookmarkPage(key)
            level = min(flowable.outline_level, self._outline_level + 1)
            self.canv.addOutlineEntry(flowable.getPlainText(), key, level=level, closed=False)
            self._outline_level = level


def styles():
    sheet = getSampleStyleSheet()
    return {
        "title": ParagraphStyle("GuideTitle", parent=sheet["Title"], fontName="Helvetica-Bold", fontSize=30, leading=35, textColor=NAVY, alignment=TA_CENTER, spaceAfter=14),
        "subtitle": ParagraphStyle("GuideSubtitle", parent=sheet["BodyText"], fontName="Helvetica", fontSize=12, leading=18, textColor=MUTED, alignment=TA_CENTER, spaceAfter=8),
        "h1": ParagraphStyle("GuideH1", parent=sheet["Heading1"], fontName="Helvetica-Bold", fontSize=18, leading=23, textColor=NAVY, spaceBefore=18, spaceAfter=10, keepWithNext=True),
        "h2": ParagraphStyle("GuideH2", parent=sheet["Heading2"], fontName="Helvetica-Bold", fontSize=13.5, leading=18, textColor=BLUE, spaceBefore=13, spaceAfter=7, keepWithNext=True),
        "h3": ParagraphStyle("GuideH3", parent=sheet["Heading3"], fontName="Helvetica-Bold", fontSize=11.5, leading=15, textColor=INK, spaceBefore=10, spaceAfter=5, keepWithNext=True),
        "body": ParagraphStyle("GuideBody", parent=sheet["BodyText"], fontName="Helvetica", fontSize=9.1, leading=13.2, textColor=INK, spaceAfter=6),
        "small": ParagraphStyle("GuideSmall", parent=sheet["BodyText"], fontName="Helvetica", fontSize=8.2, leading=10.3, textColor=INK, spaceAfter=3),
        "caption": ParagraphStyle("GuideCaption", parent=sheet["BodyText"], fontName="Helvetica-Oblique", fontSize=8.2, leading=10.5, textColor=MUTED, alignment=TA_CENTER, spaceBefore=3, spaceAfter=9),
        "quote": ParagraphStyle("GuideQuote", parent=sheet["BodyText"], fontName="Helvetica", fontSize=9, leading=13, textColor=INK, backColor=PALE_GOLD, borderColor=GOLD, borderWidth=0.7, borderPadding=8, leftIndent=0, rightIndent=0, spaceBefore=4, spaceAfter=9),
        "code": ParagraphStyle("GuideCode", parent=sheet["BodyText"], fontName="Courier", fontSize=7.5, leading=10, textColor=INK, backColor=colors.HexColor("#f4f6f8"), borderColor=RULE, borderWidth=.4, borderPadding=7, spaceBefore=3, spaceAfter=8),
        "bullet": ParagraphStyle("GuideBullet", parent=sheet["BodyText"], fontName="Helvetica", fontSize=9.1, leading=13.2, textColor=INK, leftIndent=13, firstLineIndent=-9, spaceAfter=3),
    }


def image_flow(path_text: str, caption: str | None, sty):
    source = ROOT / "docs" / path_text
    if not source.exists():
        return [Paragraph(f"Image unavailable: {inline(path_text)}", sty["quote"])]
    from PIL import Image as PILImage
    width, height = PILImage.open(source).size
    max_w = 16.8 * cm
    max_h = 15.0 * cm
    scale = min(max_w / width, max_h / height, 1)
    img = Image(str(source), width=width*scale, height=height*scale)
    result = [Spacer(1, 2), img]
    if caption:
        result.append(Paragraph(inline(caption.strip("* ")), sty["caption"]))
    return result


def make_table(lines, sty):
    rows = []
    for line in lines:
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if all(re.fullmatch(r"[-: ]+", c) for c in cells):
            continue
        rows.append(cells)
    cols = max(len(row) for row in rows)
    for row in rows:
        row += [""] * (cols-len(row))
    usable = 17.9 * cm
    widths = [usable/cols]*cols
    if cols == 4: widths = [3.2*cm, 2.1*cm, 7.0*cm, 5.6*cm]
    if cols == 3: widths = [4.4*cm, 6.3*cm, 7.2*cm]
    if cols == 2: widths = [4.9*cm, 13.0*cm]
    data = []
    header_style = ParagraphStyle("TableHeader", parent=sty["small"], textColor=colors.white, fontName="Helvetica-Bold")
    for row_i, row in enumerate(rows):
        row_style = header_style if row_i == 0 else sty["small"]
        data.append([cell_paragraph(c, row_style) for c in row])
    table = LongTable(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), NAVY), ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"), ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("GRID", (0,0), (-1,-1), .25, RULE), ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, PALE_BLUE]),
        ("LEFTPADDING", (0,0), (-1,-1), 5), ("RIGHTPADDING", (0,0), (-1,-1), 5),
        ("TOPPADDING", (0,0), (-1,-1), 5), ("BOTTOMPADDING", (0,0), (-1,-1), 5),
    ]))
    return table


def build_story():
    text = SOURCE.read_text(encoding="utf-8").replace("\r\n", "\n")
    lines = text.split("\n")
    sty = styles()
    story = []
    i = 0
    cover = True
    heading_index = 0
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1; continue
        if line == "---":
            if cover:
                story.append(PageBreak()); cover = False
            else:
                story.append(Spacer(1, 4))
            i += 1; continue
        if line.startswith("```"):
            code=[]; i += 1
            while i < len(lines) and not lines[i].startswith("```"):
                code.append(html.escape(lines[i])); i += 1
            story.append(Paragraph("<br/>".join(code) or " ", sty["code"])); i += 1; continue
        image_match = re.match(r"!\[([^]]*)\]\(([^)]+)\)", line)
        if image_match:
            caption = None
            if i+2 < len(lines) and lines[i+2].startswith("*Figure"):
                caption = lines[i+2]; i += 2
            story.extend(image_flow(image_match.group(2), caption, sty)); i += 1; continue
        if line.startswith("# "):
            title = line[2:]
            if cover:
                story.append(Spacer(1, 5.5*cm)); story.append(Paragraph(inline(title), sty["title"]))
            else:
                p=Paragraph(inline(title), sty["h1"]); heading_index += 1; p.bookmark_name=f"h{heading_index}"; p.outline_level=0; story.append(p)
            i += 1; continue
        if line.startswith("## "):
            p=Paragraph(inline(line[3:]), sty["h2"]); heading_index += 1; p.bookmark_name=f"h{heading_index}"; p.outline_level=1; story.append(p); i += 1; continue
        if line.startswith("### "):
            p=Paragraph(inline(line[4:]), sty["h3"]); heading_index += 1; p.bookmark_name=f"h{heading_index}"; p.outline_level=2; story.append(p); i += 1; continue
        if line.startswith("> "):
            story.append(Paragraph(inline(line[2:]), sty["quote"])); i += 1; continue
        if line.startswith("|") and i+1 < len(lines) and lines[i+1].startswith("|"):
            tbl=[]
            while i < len(lines) and lines[i].startswith("|"):
                tbl.append(lines[i]); i += 1
            story.append(make_table(tbl, sty)); story.append(Spacer(1, 6)); continue
        if re.match(r"^[-*] ", line):
            story.append(Paragraph("&bull; " + inline(line[2:]), sty["bullet"])); i += 1; continue
        if re.match(r"^\d+\. ", line):
            story.append(Paragraph(inline(line), sty["bullet"])); i += 1; continue
        if cover and (line.startswith("**18 July") or line.startswith("Club management")):
            story.append(Paragraph(inline(line), sty["subtitle"])); i += 1; continue
        # gather ordinary wrapped paragraph
        para=[line.strip()]; i += 1
        while i < len(lines) and lines[i].strip() and not re.match(r"^(#|>|\||```|!\[|[-*] |\d+\. )", lines[i]):
            para.append(lines[i].strip()); i += 1
        story.append(Paragraph(inline(" ".join(para)), sty["body"]))
    return story


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = GuideDoc(str(OUTPUT))
    doc.title = "Clubly / Campus One Developer Guide"
    doc.author = "Nile University Club Services"
    doc.build(build_story())
    print(OUTPUT)


if __name__ == "__main__":
    main()
