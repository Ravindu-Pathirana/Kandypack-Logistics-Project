# app/reports/pdf_generator.py
from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Flowable
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.graphics.shapes import Drawing, String
from reportlab.graphics.charts.barcharts import VerticalBarChart

# -----------------------
# Card component
# -----------------------
class PDFCard(Flowable):
    def __init__(self, width, height, title, value, bg_color=colors.HexColor("#D9EDF7"), text_color=colors.black):
        super().__init__()
        self.width = width
        self.height = height
        self.title = title
        self.value = value
        self.bg_color = bg_color
        self.text_color = text_color

    def draw(self):
        self.canv.setFillColor(self.bg_color)
        self.canv.roundRect(0, 0, self.width, self.height, 5, fill=1, stroke=0)
        self.canv.setFillColor(self.text_color)
        self.canv.setFont("Helvetica-Bold", 10)
        self.canv.drawString(10, self.height - 15, self.title)
        self.canv.setFont("Helvetica-Bold", 14)
        self.canv.drawString(10, self.height - 35, self.value)


# -----------------------
# Main PDF generation
# -----------------------
def generate_quarterly_sales_pdf(data) -> BytesIO:
    current_date = datetime.now()
    current_year = current_date.year
    current_quarter = (current_date.month - 1) // 3 + 1

    total_sales = sum(item["total_sales"] for item in data)
    total_orders = sum(item["order_count"] for item in data)

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=50,
        leftMargin=50,
        topMargin=50,
        bottomMargin=50
    )
    elements = []
    styles = getSampleStyleSheet()

    styles["Title"].alignment = 0  # LEFT
    styles["Normal"].alignment = 0  # LEFT

    # Header
    elements.append(Paragraph("Kandypack - Quarterly Sales Report", styles["Title"]))
    elements.append(Spacer(1, 0.2*cm))
    elements.append(Paragraph(f"Quarter: Q{current_quarter}", styles["Normal"]))
    elements.append(Paragraph(f"Year: {current_year}", styles["Normal"]))
    elements.append(Paragraph(f"Generated on: {current_date.strftime('%Y-%m-%d %H:%M:%S')}", styles["Normal"]))
    elements.append(Spacer(1, 0.5*cm))

    # Summary cards
    card_width = 7*cm
    card_height = 3*cm
    card1 = PDFCard(card_width, card_height, "Total Sales (Rs.)", f"{total_sales:,}", bg_color=colors.HexColor("#C8E6C9"))
    card2 = PDFCard(card_width, card_height, "Total Orders", f"{total_orders}", bg_color=colors.HexColor("#BBDEFB"))
    from reportlab.platypus import Table, TableStyle
    cards_table = Table([[card1, card2]], colWidths=[card_width, card_width])
    cards_table.setStyle(TableStyle([("VALIGN", (0,0), (-1,-1), "TOP")]))
    elements.append(cards_table)
    elements.append(Spacer(1, 0.5*cm))

    # Table of monthly sales & volume
    table_data = [["Month", "Total Sales (Rs.)", "Orders (Volume)"]]
    for item in data:
        table_data.append([item["month"], f"{item['total_sales']:,}", str(item["order_count"])])

    table = Table(table_data, colWidths=[5*cm, 5*cm, 5*cm])
    table.hAlign  = 'LEFT' 
    table_style = TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4CAF50")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.whitesmoke, colors.lightgrey])
    ])
    table.setStyle(table_style)
    elements.append(table)
    elements.append(Spacer(1, 1*cm))

    # Bar chart
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
    chart.bars[0].fillColor = colors.green
    chart.bars[1].fillColor = colors.blue
    drawing.add(String(0, 180, "Green = Total Sales", fontSize=10))
    drawing.add(String(150, 180, "Blue = Orders (scaled)", fontSize=10))
    drawing.add(chart)
    elements.append(drawing)

    doc.build(elements)
    buffer.seek(0)
    return buffer
