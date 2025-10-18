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
from app.crud.reports_crud import get_quarterly_sales_report, get_most_ordered_items
from datetime import datetime

router = APIRouter()


@router.get("/dasshboard/kpi")
def dashboard_kpis():
    return reports_crud.get_kpis()

@router.get("/reports/quarterly-sales")
def quarterly_sales_report():
    return reports_crud.get_quarterly_sales_report()

@router.get("/reports/most-ordered-items")
def generate_most_ordered_items_pdf(year: int, quarter: int):
    data = get_most_ordered_items(year, quarter)
    current_date = datetime.now()

    buffer = BytesIO()
    width, height = A4

    # -----------------------
    # Background and border
    # -----------------------
    def add_background(canvas, doc):
        canvas.setFillColor(colors.HexColor("#f7f9fc"))
        canvas.rect(0, 0, width, height, fill=1, stroke=0)
        canvas.setStrokeColor(colors.HexColor("#b0b0b0"))
        canvas.setLineWidth(2)
        margin = 25
        canvas.rect(margin, margin, width - 2*margin, height - 2*margin, fill=0, stroke=1)

    # -----------------------
    # Document setup
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
    styles["Title"].alignment = TA_LEFT
    styles["Normal"].alignment = TA_LEFT

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
    elements.append(Paragraph("<b>Kandypack - Most Ordered Items Report</b>", styles["Title"]))
    elements.append(Spacer(1, 0.01*cm))
    elements.append(Paragraph(f"Generated on: {current_date.strftime('%Y-%m-%d %H:%M')}", styles["Normal"]))
    elements.append(Spacer(1, 0.2*cm))
    elements.append(Paragraph(f"Quarter: Q{quarter}", styles["Normal"]))
    elements.append(Paragraph(f"Year: {year}", styles["Normal"]))
    elements.append(Spacer(1, 0.6*cm))

    # Summary Cards
    total_orders = sum(item["order_count"] for item in data)

    elements.append(Paragraph("Summary", subheading_style))
    elements.append(Spacer(1, 0.2*cm))

    total_orders_card = Paragraph(f"<b>Total Orders:</b> {total_orders}", styles["Normal"])

    cards_table = Table([[total_orders_card]], colWidths=[16*cm])
    cards_table.setStyle(TableStyle([
        ("LEFTPADDING", (0,0), (-1,-1), 6),
        ("RIGHTPADDING", (0,0), (-1,-1), 6),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#E3F2FD")),
        ("BOX", (0,0), (-1,-1), 0.5, colors.grey)
    ]))
    elements.append(cards_table)
    elements.append(Spacer(1, 0.5*cm))

    # Table of Most Ordered Items
    elements.append(Paragraph("Most Ordered Items", subheading_style))
    elements.append(Spacer(1, 0.2*cm))

    table_data = [["Product Name", "Order Count"]]
    for item in data:
        table_data.append([item["product_name"], str(item["order_count"])])

    table = Table(table_data, colWidths=[10*cm, 6*cm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#4CAF50")),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("ALIGN", (0,0), (-1,-1), "LEFT"),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTNAME", (0,1), (-1,-1), "Helvetica"),
        ("FONTSIZE", (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,0), 8),
        ("GRID", (0,0), (-1,-1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.whitesmoke, colors.HexColor("#f2f2f2")])
    ]))
    elements.append(table)
    elements.append(Spacer(1, 1*cm))

    # Bar chart of top 10 items
    top_items = data[:10]
    if top_items:
        elements.append(Paragraph("Top 10 Most Ordered Items", subheading_style))
        elements.append(Spacer(1, 0.2*cm))

        drawing = Drawing(400, 200)
        chart = VerticalBarChart()
        chart.x = 0
        chart.y = 20
        chart.height = 150
        chart.width = 300
        chart.data = [[item["order_count"] for item in top_items]]
        chart.categoryAxis.categoryNames = [item["product_name"] for item in top_items]
        chart.barWidth = 15
        chart.groupSpacing = 10
        chart.barSpacing = 5
        chart.valueAxis.valueMin = 0
        chart.valueAxis.valueMax = max(item["order_count"] for item in top_items) * 1.2
        chart.valueAxis.valueStep = max(item["order_count"] for item in top_items) // 5 or 1
        chart.bars[0].fillColor = colors.HexColor("#4CAF50")
        drawing.add(String(0, 180, "Green = Order Count", fontSize=10))
        drawing.add(chart)
        elements.append(drawing)

    # -----------------------
    # Build PDF with background
    # -----------------------
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id='normal')
    doc.addPageTemplates([PageTemplate(id='bordered', frames=[frame], onPage=add_background)])
    doc.build(elements)

    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=most_ordered_items_q{quarter}_{year}.pdf"}
    )


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




@router.get("/reports/city-wise-sales")
def city_wise_sales_report(year: int = Query(..., description="Year, e.g., 2025"),
                           quarter: int = Query(..., ge=1, le=4, description="Quarter (1-4)")):
    data = reports_crud.get_city_wise_sales(year, quarter)
    return data


@router.get("/reports/city-wise-sales/pdf")
def generate_city_wise_sales_pdf(year: int = Query(...), quarter: int = Query(...)):
    data = reports_crud.get_city_wise_sales(year, quarter)
    current_date = datetime.now()

    buffer = BytesIO()
    width, height = A4

    # Background + border
    def add_background(canvas, doc):
        canvas.setFillColor(colors.HexColor("#f7f9fc"))
        canvas.rect(0, 0, width, height, fill=1, stroke=0)
        canvas.setStrokeColor(colors.HexColor("#b0b0b0"))
        canvas.setLineWidth(2)
        margin = 25
        canvas.rect(margin, margin, width - 2*margin, height - 2*margin, fill=0, stroke=1)

    # Document setup
    doc = SimpleDocTemplate(buffer, pagesize=A4,
                            rightMargin=50, leftMargin=60,
                            topMargin=60, bottomMargin=50)
    styles = getSampleStyleSheet()
    styles["Title"].alignment = TA_LEFT
    styles["Normal"].alignment = TA_LEFT

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
    elements.append(Paragraph("<b>Kandypack - City-wise Sales Report</b>", styles["Title"]))
    elements.append(Spacer(1, 0.2*cm))
    elements.append(Paragraph(f"Generated on: {current_date.strftime('%Y-%m-%d %H:%M')}", styles["Normal"]))
    elements.append(Paragraph(f"Quarter: Q{quarter}", styles["Normal"]))
    elements.append(Paragraph(f"Year: {year}", styles["Normal"]))
    elements.append(Spacer(1, 0.5*cm))

    # Summary Cards
    total_sales = sum(float(item["total_sales"]) for item in data)
    total_orders = sum(float(item["order_count"]) for item in data)

    elements.append(Paragraph("Summary", subheading_style))
    total_sales_card = Card(f"Total Sales: Rs. {total_sales:,}", bg_color=colors.HexColor("#E8F5E9"))
    total_orders_card = Card(f"Total Orders: {total_orders}", bg_color=colors.HexColor("#E3F2FD"))

    cards_table = Table([[total_sales_card, CardSpacer(), total_orders_card]], colWidths=[8*cm, 0.5*cm, 8*cm])
    elements.append(cards_table)
    elements.append(Spacer(1, 0.5*cm))

    # Table of City-wise sales
    elements.append(Paragraph("City-wise Sales Details", subheading_style))
    table_data = [["City", "Total Sales (Rs.)", "Orders"]]
    for item in data:
        table_data.append([item["city"], f"{item['total_sales']:,}", str(item["order_count"])])

    table = Table(table_data, colWidths=[8*cm, 4*cm, 4*cm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#4CAF50")),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("ALIGN", (0,0), (-1,-1), "LEFT"),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTNAME", (0,1), (-1,-1), "Helvetica"),
        ("FONTSIZE", (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,0), 8),
        ("GRID", (0,0), (-1,-1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.whitesmoke, colors.HexColor("#f2f2f2")])
    ]))
    elements.append(table)
    elements.append(Spacer(1, 0.5*cm))

    # Bar chart for top cities
    top_cities = data[:10]  # Top 10 cities by sales
    if top_cities:
        elements.append(Paragraph("Top Cities by Sales", subheading_style))
        drawing = Drawing(400, 200)
        chart = VerticalBarChart()
        chart.x = 0
        chart.y = 20
        chart.height = 150
        chart.width = 300
        chart.data = [[float(item["total_sales"]) for item in top_cities]]
        chart.categoryAxis.categoryNames = [item["city"] for item in top_cities]
        chart.barWidth = 15
        chart.groupSpacing = 10
        chart.barSpacing = 5
        chart.valueAxis.valueMin = 0
        chart.valueAxis.valueMax = max(float(item["total_sales"]) for item in top_cities) * 1.2
        chart.bars[0].fillColor = colors.HexColor("#4CAF50")
        drawing.add(chart)
        elements.append(drawing)

    # Build PDF
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id='normal')
    doc.addPageTemplates([PageTemplate(id='bordered', frames=[frame], onPage=add_background)])
    doc.build(elements)

    buffer.seek(0)
    return StreamingResponse(buffer, media_type="application/pdf",
                             headers={"Content-Disposition": f"attachment; filename=city_wise_sales_q{quarter}_{year}.pdf"})



@router.get("/reports/route-wise-report")
def route_wise_report(year: int = Query(..., description="Year, e.g., 2025"),
                      quarter: int = Query(..., ge=1, le=4, description="Quarter (1-4)")):
    data = reports_crud.get_route_wise_report(year, quarter)
    return data



@router.get("/reports/route-wise-report/pdf")
def generate_route_wise_report_pdf(year: int = Query(...), quarter: int = Query(...)):
    data = reports_crud.get_route_wise_report(year, quarter)
    current_date = datetime.now()

    # --- Utility function to clean None values ---
    def safe(value, suffix=""):
        if value is None:
            return ""
        if isinstance(value, float):
            return f"{value:.2f}{suffix}"
        return f"{value}{suffix}"

    # --- Setup PDF ---
    buffer = BytesIO()
    width, height = A4

    def add_background(canvas, doc):
        """Draws background and border."""
        canvas.setFillColor(colors.HexColor("#f7f9fc"))
        canvas.rect(0, 0, width, height, fill=1, stroke=0)
        canvas.setStrokeColor(colors.HexColor("#b0b0b0"))
        canvas.setLineWidth(2)
        margin = 25
        canvas.rect(margin, margin, width - 2 * margin, height - 2 * margin, fill=0, stroke=1)

    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=50, leftMargin=60,
        topMargin=60, bottomMargin=50
    )
    styles = getSampleStyleSheet()
    styles["Title"].alignment = TA_LEFT
    styles["Normal"].alignment = TA_LEFT

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

    # --- Header ---
    elements.append(Paragraph("<b>Kandypack - Route-wise Delivery Report</b>", styles["Title"]))
    elements.append(Spacer(1, 0.2 * 12))
    elements.append(Paragraph(f"Generated on: {current_date.strftime('%Y-%m-%d %H:%M')}", styles["Normal"]))
    elements.append(Paragraph(f"Quarter: Q{quarter}", styles["Normal"]))
    elements.append(Paragraph(f"Year: {year}", styles["Normal"]))
    elements.append(Spacer(1, 12))

    # --- Summary ---
    total_deliveries = sum(item.get("total_deliveries", 0) or 0 for item in data)
    delivered_count = sum(item.get("delivered_count", 0) or 0 for item in data)
    delayed_count = sum(item.get("delayed_count", 0) or 0 for item in data)
    avg_on_time = round(
        sum(item.get("on_time_percentage", 0) or 0 for item in data) / len(data), 2
    ) if data else 0

    elements.append(Paragraph("Summary", subheading_style))

    summary_table_data = [
        ["Metric", "Value"],
        ["Total Deliveries", safe(total_deliveries)],
        ["Delivered", safe(delivered_count)],
        ["Delayed", safe(delayed_count)],
        ["Average On-time %", safe(avg_on_time, "%")],
    ]

    summary_table = Table(summary_table_data, colWidths=[4 * 72, 2.5 * 72])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1976D2")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.whitesmoke, colors.HexColor("#f2f2f2")]),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 15))

    # --- Main Table ---
    elements.append(Paragraph("Route-wise Delivery Performance", subheading_style))
    table_data = [["Route ID", "Area Name", "Total", "Delivered", "Delayed", "Avg Hrs", "On-time %"]]

    for item in data:
        table_data.append([
            safe(item.get("route_id")),
            safe(item.get("area_name")),
            safe(item.get("total_deliveries")),
            safe(item.get("delivered_count")),
            safe(item.get("delayed_count")),
            safe(item.get("avg_delivery_hours")),
            safe(item.get("on_time_percentage"), "%"),
        ])

    main_table = Table(table_data, colWidths=[70, 120, 60, 60, 60, 60, 70])
    main_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1976D2")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1),
         [colors.whitesmoke, colors.HexColor("#f2f2f2")]),
    ]))
    elements.append(main_table)
    elements.append(Spacer(1, 15))

    # --- Chart (only if data exists) ---
    top_routes = sorted(data, key=lambda x: x.get("on_time_percentage", 0) or 0, reverse=True)[:8]
    if top_routes:
        elements.append(Paragraph("Top Routes by On-time Delivery %", subheading_style))
        drawing = Drawing(400, 200)
        chart = VerticalBarChart()
        chart.x = 0
        chart.y = 20
        chart.height = 150
        chart.width = 320
        chart.data = [[float(item.get("on_time_percentage", 0) or 0) for item in top_routes]]
        chart.categoryAxis.categoryNames = [item.get("route_id", "") for item in top_routes]
        chart.barWidth = 20
        chart.valueAxis.valueMin = 0
        chart.valueAxis.valueMax = 100
        chart.valueAxis.labels.fontSize = 8
        chart.categoryAxis.labels.fontSize = 8
        chart.bars[0].fillColor = colors.HexColor("#1976D2")
        drawing.add(chart)
        elements.append(drawing)

    # --- Build PDF ---
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
    doc.addPageTemplates([PageTemplate(id="bordered", frames=[frame], onPage=add_background)])
    doc.build(elements)

    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=route_wise_report_q{quarter}_{year}.pdf"}
    )




@router.get("/reports/driver-hours")
def driver_hours_report(year: int = Query(..., description="Year, e.g., 2025"),
                        quarter: int = Query(..., ge=1, le=4, description="Quarter (1-4)")):
    data = reports_crud.get_driver_hours_report(year, quarter)
    return data



@router.get("/reports/driver-hours/pdf")
def generate_driver_hours_pdf(year: int = Query(...), quarter: int = Query(...)):
    data = reports_crud.get_driver_hours_report(year, quarter)
    current_date = datetime.now()
    buffer = BytesIO()
    width, height = A4

    def add_background(canvas, doc):
        canvas.setFillColor(colors.HexColor("#f7f9fc"))
        canvas.rect(0, 0, width, height, fill=1, stroke=0)
        canvas.setStrokeColor(colors.HexColor("#b0b0b0"))
        canvas.setLineWidth(2)
        margin = 25
        canvas.rect(margin, margin, width - 2*margin, height - 2*margin, fill=0, stroke=1)

    doc = SimpleDocTemplate(buffer, pagesize=A4,
                            rightMargin=50, leftMargin=60,
                            topMargin=60, bottomMargin=50)
    styles = getSampleStyleSheet()
    styles["Title"].alignment = TA_LEFT
    styles["Normal"].alignment = TA_LEFT

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
    elements.append(Paragraph("<b>Kandypack - Driver & Assistant Hours Report</b>", styles["Title"]))
    elements.append(Spacer(1, 0.2*cm))
    elements.append(Paragraph(f"Generated on: {current_date.strftime('%Y-%m-%d %H:%M')}", styles["Normal"]))
    elements.append(Paragraph(f"Quarter: Q{quarter}", styles["Normal"]))
    elements.append(Paragraph(f"Year: {year}", styles["Normal"]))
    elements.append(Spacer(1, 0.5*cm))

    # Table
    table_data = [["Driver", "Assistant", "Total Deliveries", "Total Hours", "Avg Hours/Delivery"]]
    for item in data:
        table_data.append([
            item["driver_name"], 
            item["assistant_name"],
            str(item["total_deliveries"]),
            str(item["total_hours"]),
            str(item["avg_hours_per_delivery"])
        ])

    table = Table(table_data, colWidths=[4*cm, 4*cm, 3*cm, 3*cm, 3*cm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#1976D2")),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("ALIGN", (0,0), (-1,-1), "CENTER"),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,0), 8),
        ("GRID", (0,0), (-1,-1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.whitesmoke, colors.HexColor("#f2f2f2")])
    ]))
    elements.append(table)
    elements.append(Spacer(1, 0.5*cm))

    # Build PDF
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id='normal')
    doc.addPageTemplates([PageTemplate(id='bordered', frames=[frame], onPage=add_background)])
    doc.build(elements)

    buffer.seek(0)
    return StreamingResponse(buffer, media_type="application/pdf",
                             headers={"Content-Disposition": f"attachment; filename=driver_hours_q{quarter}_{year}.pdf"})






@router.get("/reports/truck-usage")
def truck_usage_report(
    year: int = Query(..., description="Year, e.g., 2025"),
    month: int = Query(..., ge=1, le=12, description="Month (1-12)")
):
    data = reports_crud.get_truck_usage_report(year, month)
    return data


@router.get("/reports/truck-usage/pdf")
def generate_truck_usage_pdf(
    year: int = Query(...),
    month: int = Query(...)
):
    data = reports_crud.get_truck_usage_report(year, month)
    current_date = datetime.now()
    buffer = BytesIO()
    width, height = A4

    def add_background(canvas, doc):
        canvas.setFillColor(colors.HexColor("#f7f9fc"))
        canvas.rect(0, 0, width, height, fill=1, stroke=0)
        canvas.setStrokeColor(colors.HexColor("#b0b0b0"))
        canvas.setLineWidth(2)
        margin = 25
        canvas.rect(margin, margin, width - 2*margin, height - 2*margin, fill=0, stroke=1)

    doc = SimpleDocTemplate(buffer, pagesize=A4,
                            rightMargin=50, leftMargin=60,
                            topMargin=60, bottomMargin=50)
    styles = getSampleStyleSheet()
    styles["Title"].alignment = TA_LEFT
    styles["Normal"].alignment = TA_LEFT

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
    elements.append(Paragraph("<b>Kandypack - Truck Usage Report</b>", styles["Title"]))
    elements.append(Spacer(1, 0.2*cm))
    elements.append(Paragraph(f"Generated on: {current_date.strftime('%Y-%m-%d %H:%M')}", styles["Normal"]))
    elements.append(Paragraph(f"Month: {month}", styles["Normal"]))
    elements.append(Paragraph(f"Year: {year}", styles["Normal"]))
    elements.append(Spacer(1, 0.5*cm))

    # Table
    elements.append(Paragraph("Truck Usage Details", subheading_style))
    table_data = [["Truck ID", "Total Deliveries", "Total Hours", "Delivered", "Delayed"]]
    for item in data:
        table_data.append([
            str(item["truck_id"]),
            str(item["total_deliveries"]),
            f"{item['total_hours']:.2f}",
            str(item["delivered_count"]),
            str(item["delayed_count"])
        ])

    table = Table(table_data, colWidths=[3*cm, 3*cm, 3*cm, 3*cm, 3*cm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#1976D2")),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("ALIGN", (0,0), (-1,-1), "CENTER"),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 9),
        ("BOTTOMPADDING", (0,0), (-1,0), 8),
        ("GRID", (0,0), (-1,-1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.whitesmoke, colors.HexColor("#f2f2f2")])
    ]))
    elements.append(table)

    # Build PDF
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id='normal')
    doc.addPageTemplates([PageTemplate(id='bordered', frames=[frame], onPage=add_background)])
    doc.build(elements)

    buffer.seek(0)
    return StreamingResponse(buffer, media_type="application/pdf",
                             headers={"Content-Disposition": f"attachment; filename=truck_usage_{year}_{month}.pdf"})



@router.get("/reports/customer-order-history")
def customer_order_history(customer_id: int = Query(..., description="Customer ID")):
    """
    Get all orders of a customer along with delivery details.
    """
    data = reports_crud.get_customer_order_history(customer_id)
    return data


@router.get("/reports/customer-order-history/pdf")
def generate_customer_order_history_pdf(customer_id: int = Query(..., description="Customer ID")):
    from datetime import datetime as dt
    
    data = reports_crud.get_customer_order_history(customer_id)
    current_date = datetime.now()

    buffer = BytesIO()
    width, height = A4

    # Background + border
    def add_background(canvas, doc):
        canvas.setFillColor(colors.HexColor("#f7f9fc"))
        canvas.rect(0, 0, width, height, fill=1, stroke=0)
        canvas.setStrokeColor(colors.HexColor("#b0b0b0"))
        canvas.setLineWidth(2)
        margin = 25
        canvas.rect(margin, margin, width - 2*margin, height - 2*margin, fill=0, stroke=1)

    doc = SimpleDocTemplate(buffer, pagesize=A4,
                            rightMargin=50, leftMargin=50,
                            topMargin=60, bottomMargin=50)
    
    # Define template early
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id='normal')
    doc.addPageTemplates([PageTemplate(id='bordered', frames=[frame], onPage=add_background)])
    
    styles = getSampleStyleSheet()
    styles["Title"].alignment = TA_LEFT
    styles["Normal"].alignment = TA_LEFT

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
    elements.append(Paragraph("<b>Kandypack - Customer Order History</b>", styles["Title"]))
    elements.append(Spacer(1, 0.2*cm))
    elements.append(Paragraph(f"Generated on: {current_date.strftime('%Y-%m-%d %H:%M')}", styles["Normal"]))
    elements.append(Paragraph(f"Customer ID: {customer_id}", styles["Normal"]))
    elements.append(Spacer(1, 0.5*cm))

    # Summary
    total_orders = len(data)
    delivered_count = sum(1 for d in data if d["delivery_status"] == "Delivered")
    delayed_count = sum(1 for d in data if d["delivery_status"] == "Delayed")
    pending_count = sum(1 for d in data if d["delivery_status"] == "Pending")

    elements.append(Paragraph("Summary", subheading_style))
    
    # Summary stats as simple text instead of cards to avoid potential issues
    summary_data = [
        ["Total Orders", "Delivered", "Delayed", "Pending"],
        [str(total_orders), str(delivered_count), str(delayed_count), str(pending_count)]
    ]
    
    summary_table = Table(summary_data, colWidths=[doc.width/4]*4)
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#1976D2")),
        ("BACKGROUND", (0,1), (0,1), colors.HexColor("#E3F2FD")),
        ("BACKGROUND", (1,1), (1,1), colors.HexColor("#E8F5E9")),
        ("BACKGROUND", (2,1), (2,1), colors.HexColor("#FFEBEE")),
        ("BACKGROUND", (3,1), (3,1), colors.HexColor("#FFF8E1")),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("ALIGN", (0,0), (-1,-1), "CENTER"),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTNAME", (0,1), (-1,1), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 11),
        ("TOPPADDING", (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("GRID", (0,0), (-1,-1), 1, colors.grey),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 0.5*cm))

    # Table of orders
    elements.append(Paragraph("Order Details", subheading_style))
    
    if not data:
        elements.append(Paragraph("No order history found for this customer.", styles["Normal"]))
    else:
        table_data = [["Order ID", "Order Date", "Total Price (Rs.)", "Truck ID", "Route", 
                       "Scheduled Departure", "Actual Departure", "Actual Arrival", "Status"]]
        
        # Enhanced data handling
        def safe_str(value, max_len=25):
            if value is None:
                return ""
            s = str(value)
            return s[:max_len] + "..." if len(s) > max_len else s
        
        def safe_date_fmt(value):
            if value is None:
                return ""
            # Handle both string and datetime objects
            if isinstance(value, str):
                try:
                    # Try to parse ISO format
                    parsed = dt.fromisoformat(value.replace('Z', '+00:00'))
                    return parsed.strftime("%Y-%m-%d %H:%M")
                except:
                    # If parsing fails, return the string as-is (for date-only strings)
                    return value
            elif hasattr(value, 'strftime'):
                return value.strftime("%Y-%m-%d %H:%M")
            return str(value)
        
        def safe_price(p):
            try:
                return f"{float(p):,.2f}" if p is not None else "0.00"
            except:
                return "0.00"
        
        for d in data:
            table_data.append([
                safe_str(d.get("order_id")),
                safe_date_fmt(d.get("order_date")),
                safe_price(d.get("total_price")),
                safe_str(d.get("truck_id")),
                safe_str(d.get("route_id")),
                safe_date_fmt(d.get("scheduled_departure")),
                safe_date_fmt(d.get("actual_departure")),
                safe_date_fmt(d.get("actual_arrival")),
                safe_str(d.get("delivery_status"))
            ])

        # Calculate available width and distribute proportionally
        available_width = doc.width
        
        col_widths = [
            available_width * 0.08,  # Order ID
            available_width * 0.10,  # Order Date (shorter for date-only)
            available_width * 0.10,  # Total Price
            available_width * 0.07,  # Truck ID
            available_width * 0.07,  # Route
            available_width * 0.14,  # Scheduled Departure
            available_width * 0.14,  # Actual Departure
            available_width * 0.14,  # Actual Arrival
            available_width * 0.16   # Status
        ]
        
        table = Table(table_data, colWidths=col_widths)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#1976D2")),
            ("TEXTCOLOR", (0,0), (-1,0), colors.white),
            ("ALIGN", (0,0), (-1,-1), "CENTER"),
            ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
            ("FONTSIZE", (0,0), (-1,-1), 8),
            ("TOPPADDING", (0,0), (-1,-1), 4),
            ("BOTTOMPADDING", (0,0), (-1,-1), 4),
            ("GRID", (0,0), (-1,-1), 0.5, colors.grey),
            ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.whitesmoke, colors.HexColor("#f2f2f2")]),
            ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
            ("LEFTPADDING", (0,0), (-1,-1), 3),
            ("RIGHTPADDING", (0,0), (-1,-1), 3)
        ]))
        elements.append(table)

    # Build PDF
    doc.build(elements)

    buffer.seek(0)
    return StreamingResponse(buffer, media_type="application/pdf",
                             headers={"Content-Disposition": f"attachment; filename=customer_{customer_id}_order_history.pdf"})