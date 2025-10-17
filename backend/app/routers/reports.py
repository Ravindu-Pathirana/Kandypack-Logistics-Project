from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
# from app.models.report_models import KPI 
from app.crud import reports_crud
from typing import List
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.graphics.shapes import Drawing, String
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics import renderPDF
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageTemplate, Frame, Flowable
)
from reportlab.lib.units import cm
from app.crud.reports_crud import get_quarterly_sales_report
from datetime import datetime

router = APIRouter()


@router.get("/dasshboard/kpi")
def dashboard_kpis():
    return reports_crud.get_kpis()

@router.get("/reports/quarterly-sales")
def quarterly_sales_report():
    return reports_crud.get_quarterly_sales_report()

@router.get("/reports/most-ordered-items")
def sample_report(
    year: int = Query(..., description="Year to filter orders, e.g., 2025"),
    quarter: int = Query(..., ge=1, le=4, description="Quarter (1-4) to filter orders")):
    """
    Get most ordered items for a given year and quarter.
    """
    return reports_crud.get_most_ordered_items(year, quarter)


# @router.get("/reports/city-wise-sales")
# def city_wise_sales_report():
#     return reports_crud.get_city_wise_sales()

class Card(Flowable):
    def __init__(self, text, width=8*cm, height=3*cm, bg_color=colors.lightblue):
        super().__init__()
        self.text = text
        self.width = width
        self.height = height
        self.bg_color = bg_color

    def draw(self):
        # Draw rounded rectangle
        self.canv.setFillColor(self.bg_color)
        self.canv.roundRect(0, 0, self.width, self.height, radius=10, fill=1, stroke=0)
        
        # Draw text inside with padding
        self.canv.setFillColor(colors.black)
        self.canv.setFont("Helvetica-Bold", 12)
        self.canv.drawString(10, self.height/2, self.text)


class CardSpacer(Flowable):
    def __init__(self, width=1*cm):
        super().__init__()
        self.width = width
        self.height = 0
    def wrap(self, availWidth, availHeight):
    # tell ReportLab how much space this Flowable takes
        return self.width, self.height

    def draw(self):
        pass

@router.get("/reports/quarterly-sales/pdf")
def generate_quarterly_sales_pdf():
    
    data = get_quarterly_sales_report()
    current_date = datetime.now()
    current_year = current_date.year
    current_quarter = (current_date.month - 1) // 3 + 1

    total_sales = sum(item["total_sales"] for item in data)
    total_orders = sum(item["order_count"] for item in data)

    buffer = BytesIO()
    width, height = A4

    # -----------------------
    # Draw background + border
    # -----------------------
    def add_background(canvas, doc):
        # Light, professional background color
        canvas.setFillColor(colors.HexColor("#f7f9fc"))
        canvas.rect(0, 0, width, height, fill=1, stroke=0)

        # Border (subtle gray)
        canvas.setStrokeColor(colors.HexColor("#b0b0b0"))
        canvas.setLineWidth(2)
        margin = 25
        canvas.rect(margin, margin, width - 2*margin, height - 2*margin, fill=0, stroke=1)

    # -----------------------
    # Build document
    # -----------------------
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=50,
        leftMargin=60,
        topMargin=60,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()
    styles["Title"].alignment = 0  # left align
    styles["Normal"].alignment = 0

    subheading_style = ParagraphStyle(
    name="SubHeading",
    fontName="Helvetica-Bold",
    fontSize=13,
    leading=16,
    textColor=colors.HexColor("#2E4053"),
    alignment=TA_LEFT,
    spaceAfter=6
)

    elements = []

    # Header
    elements.append(Paragraph("<b>Kandypack - Quarterly Sales Report</b>", styles["Title"]))
    elements.append(Spacer(1, 0.01*cm))
    elements.append(Paragraph(f"Generated on: {current_date.strftime('%Y-%m-%d %H:%M')}", styles["Normal"]))
    elements.append(Spacer(1, 0.2*cm))
    elements.append(Paragraph(f"Quarter: Q{current_quarter}", styles["Normal"]))
    elements.append(Paragraph(f"Year: {current_year}", styles["Normal"]))
    elements.append(Spacer(1, 0.6*cm))



    elements.append(Paragraph("Quarterly Sales Summery", subheading_style))
    elements.append(Spacer(1, 0.2*cm))

    total_sales_card = Card(f"Total Sales: Rs. {total_sales:,}", bg_color=colors.HexColor("#E8F5E9"))
    total_orders_card = Card(f"Total Orders: {total_orders}", bg_color=colors.HexColor("#E3F2FD"))


    # Wrap them in a Table to make horizontal layout
    cards_table = Table(
        [[total_sales_card, None, total_orders_card]],  # middle None column for gap
        colWidths=[8*cm, 0.5*cm, 8*cm],  # adjust gap here
        hAlign="LEFT"
    )

    cards_table.setStyle(
        TableStyle([
            ("LEFTPADDING", (0,0), (-1,-1), 0),
            ("RIGHTPADDING", (0,0), (-1,-1), 0),
            ("VALIGN", (0,0), (-1,-1), "TOP"),
        ])
    )

    elements.append(cards_table)
    elements.append(Spacer(1, 0.5*cm))  # space after cards
            

    # -----------------------
    # Table of monthly sales & volume
    # -----------------------


    
    elements.append(Paragraph("Quarterly Sales Monthly Breakdown", subheading_style))
    elements.append(Spacer(1, 0.2*cm))
    table_data = [["Month", "Total Sales (Rs.)", "Orders (Volume)"]]
    for item in data:
        table_data.append([
            item["month"],
            f"{item['total_sales']:,}",
            str(item["order_count"])
        ])

    table = Table(table_data, colWidths=[5*cm, 5*cm, 5*cm])
    table.hAlign = 'LEFT'
    table_style = TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4CAF50")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1),
            [colors.whitesmoke, colors.HexColor("#f2f2f2")])
    ])
    table.setStyle(table_style)
    elements.append(table)
    elements.append(Spacer(1, 1*cm))

    elements.append(Paragraph("Sales vs Order Volume", subheading_style))
    elements.append(Spacer(1, 0.2*cm))

    # -----------------------
    # Bar chart (Sales vs Volume)
    # -----------------------
    drawing = Drawing(400, 200)
    chart = VerticalBarChart()
    chart.x = 0
    chart.y = 20
    chart.height = 150
    chart.width = 300
    chart.data = [
        [float(item["total_sales"]) for item in data],
        [float(item["order_count"]*1000) for item in data]
    ]
    chart.categoryAxis.categoryNames = [item["month"] for item in data]
    chart.barWidth = 15
    chart.groupSpacing = 10
    chart.barSpacing = 5
    chart.valueAxis.valueMin = 0
    chart.valueAxis.valueMax = max(
        max([item["total_sales"] for item in data]),
        max([item["order_count"]*1000 for item in data])
    ) * 1.2
    chart.valueAxis.valueStep = 50000
    chart.bars[0].fillColor = colors.HexColor("#4CAF50")
    chart.bars[1].fillColor = colors.HexColor("#1976D2")

    drawing.add(String(0, 180, "Green = Total Sales", fontSize=10))
    drawing.add(String(150, 180, "Blue = Orders (scaled)", fontSize=10))
    drawing.add(chart)
    elements.append(drawing)

    # -----------------------
    # Build with background and border
    # -----------------------
    frame = Frame(doc.leftMargin, doc.bottomMargin,
                  doc.width, doc.height, id='normal')
    doc.addPageTemplates([PageTemplate(id='bordered', frames=[frame], onPage=add_background)])

    doc.build(elements)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=quarterly_sales_report.pdf"}
    )