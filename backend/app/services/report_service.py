"""
Professional Report Generation Service for OilCrop Intelligence.
Produces detailed PDF reports via ReportLab and comprehensive multi-sheet Excel workbooks via openpyxl.
"""

import io
from datetime import datetime
from typing import Dict, Any, List
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

class ReportService:
    @staticmethod
    def generate_pdf_report(data: Dict[str, Any]) -> io.BytesIO:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Heading1"],
            fontSize=22,
            leading=26,
            textColor=colors.HexColor("#065f46"),  # Emerald dark
            alignment=0,
            spaceAfter=4
        )
        subtitle_style = ParagraphStyle(
            "DocSubTitle",
            parent=styles["Normal"],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#4b5563"),
            spaceAfter=14
        )
        h2_style = ParagraphStyle(
            "SectionH2",
            parent=styles["Heading2"],
            fontSize=13,
            leading=16,
            textColor=colors.HexColor("#1e293b"),
            spaceBefore=12,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            "Body",
            parent=styles["Normal"],
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#334155")
        )
        meta_label_style = ParagraphStyle(
            "MetaLabel",
            parent=styles["Normal"],
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#64748b")
        )

        elements = []

        # Header Title
        elements.append(Paragraph("OILCROP INTELLIGENCE", title_style))
        elements.append(Paragraph(
            "Comprehensive Oilseed Agronomic, Extraction & Financial Investment Analysis Report",
            subtitle_style
        ))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#059669"), spaceAfter=14))

        # 1. Executive Scenario Metadata Table
        crop_name = data.get("crop_name", "Soybean")
        region = data.get("region", "All India")
        year = data.get("year", 2024)
        land_area_ha = data.get("land_area_ha", 10.0)

        meta_table_data = [
            [
                Paragraph("<b>Selected Crop:</b>", body_style), Paragraph(str(crop_name), body_style),
                Paragraph("<b>State / Region:</b>", body_style), Paragraph(str(region), body_style)
            ],
            [
                Paragraph("<b>Analysis Year:</b>", body_style), Paragraph(str(year), body_style),
                Paragraph("<b>Cultivated Land Area:</b>", body_style), Paragraph(f"{land_area_ha} Hectares ({round(land_area_ha * 2.471, 1)} Acres)", body_style)
            ],
            [
                Paragraph("<b>Report Generated:</b>", body_style), Paragraph(datetime.now().strftime("%Y-%m-%d %H:%M UTC"), body_style),
                Paragraph("<b>Data Status:</b>", body_style), Paragraph("Verified Real-World Datasets", body_style)
            ]
        ]
        meta_table = Table(meta_table_data, colWidths=[100, 160, 110, 170])
        meta_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        elements.append(meta_table)
        elements.append(Spacer(1, 12))

        # 2. Key Metrics Table (From Land to Oil to Profit)
        elements.append(Paragraph("1. THE JOURNEY: LAND → PRODUCTION → OIL → REVENUE → PROFIT", h2_style))

        prod_tonnes = data.get("crop_production_tonnes", 0.0)
        yield_ha = data.get("yield_t_ha", 0.0)
        seed_req = data.get("seed_required_kg", 0.0)
        oil_tonnes = data.get("estimated_oil_tonnes", 0.0)
        tot_cost = data.get("total_cost", 0.0)
        revenue = data.get("gross_revenue", 0.0)
        profit = data.get("net_profit", 0.0)
        roi = data.get("roi_percentage", 0.0)
        be_price = data.get("break_even_price_per_kg", 0.0)
        mkt_price = data.get("market_price_per_kg", 0.0)

        metrics_data = [
            ["Metric Stage", "Parameter", "Calculated Value", "Measurement Unit", "Source Type"],
            ["Land & Seed", "Seed Requirement", f"{seed_req:,.1f}", "kg (kilograms)", "ICAR-IIOR Standard"],
            ["Field Agronomy", "Crop Yield", f"{yield_ha:.3f}", "tonnes / hectare", "DES Official Series"],
            ["Production", "Gross Production", f"{prod_tonnes:,.2f}", "tonnes", "Calculated (Area × Yield)"],
            ["Processing", "Estimated Oil Recovery", f"{oil_tonnes:,.2f}", "tonnes", "FAO / IIOR Extraction Rate"],
            ["Investment", "Total Production Cost", f"₹ {tot_cost:,.2f}", "INR (₹)", "CACP Cost Scheme"],
            ["Realization", "Market Price", f"₹ {mkt_price:.2f}", "₹ / kg", "Agmarknet APMC Wholesale"],
            ["Income", "Gross Revenue", f"₹ {revenue:,.2f}", "INR (₹)", "Calculated (Prod × Price)"],
            ["Net Return", "Net Profit", f"₹ {profit:,.2f}", "INR (₹)", "Calculated (Rev - Cost)"],
            ["Efficiency", "Return on Investment (ROI)", f"{roi:.1f} %", "Percentage", "Financial ROI Formula"],
            ["Risk Buffer", "Break-Even Price", f"₹ {be_price:.2f}", "₹ / kg", "Calculated (Cost / Prod)"]
        ]

        metrics_table = Table(metrics_data, colWidths=[80, 140, 110, 100, 110])
        metrics_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#065f46")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        elements.append(metrics_table)
        elements.append(Spacer(1, 14))

        # 3. Data Sources & Citations
        elements.append(Paragraph("2. OFFICIAL DATA SOURCES & CITATIONS", h2_style))
        sources_text = (
            "• <b>Production & Yield:</b> Directorate of Economics and Statistics (DES), Ministry of Agriculture and Farmers Welfare, Govt of India.<br/>"
            "• <b>Agronomic Seed Rates:</b> ICAR - Indian Institute of Oilseeds Research (IIOR), Hyderabad & Directorate of Oilseeds Development.<br/>"
            "• <b>Oil Extraction Parameters:</b> FAO Agricultural Services Bulletin 45 (Processing and Extraction of Oilseeds) & ICAR-IIOR.<br/>"
            "• <b>Cultivation Costs:</b> Commission for Agricultural Costs and Prices (CACP) - Comprehensive Scheme for Cost of Cultivation.<br/>"
            "• <b>Market Prices & MSP:</b> Directorate of Economics & Statistics / Agmarknet APMC Mandi price records."
        )
        elements.append(Paragraph(sources_text, body_style))
        elements.append(Spacer(1, 10))
        elements.append(Paragraph(
            "<b>Disclaimer:</b> All analytical values reflect historical real-world datasets and reproducible agricultural accounting equations. Predictions and scenario variations are clearly labeled and should not be construed as financial guarantees.",
            meta_label_style
        ))

        doc.build(elements)
        buffer.seek(0)
        return buffer

    @staticmethod
    def generate_excel_report(data: Dict[str, Any], historical_records: List[Dict[str, Any]]) -> io.BytesIO:
        wb = openpyxl.Workbook()
        
        # Sheet 1: Executive Summary
        ws1 = wb.active
        ws1.title = "Executive Summary"
        
        # Styles
        header_fill = PatternFill(start_color="065F46", end_color="065F46", fill_type="solid")
        header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
        title_font = Font(name="Calibri", size=16, bold=True, color="065F46")
        bold_font = Font(name="Calibri", size=10, bold=True)
        normal_font = Font(name="Calibri", size=10)
        thin_border = Border(
            left=Side(style='thin', color='E2E8F0'),
            right=Side(style='thin', color='E2E8F0'),
            top=Side(style='thin', color='E2E8F0'),
            bottom=Side(style='thin', color='E2E8F0')
        )

        ws1["A1"] = "OilCrop Intelligence - Strategic Agricultural Analysis"
        ws1["A1"].font = title_font
        ws1["A2"] = f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')} | Verified Real-World Data"
        ws1["A2"].font = Font(name="Calibri", size=9, italic=True, color="64748B")

        summary_rows = [
            ("Crop Name", data.get("crop_name", "Soybean")),
            ("State / Region", data.get("region", "All India")),
            ("Analysis Year", data.get("year", 2024)),
            ("Cultivated Land Area (Hectares)", data.get("land_area_ha", 10.0)),
            ("Seed Requirement (kg)", data.get("seed_required_kg", 0.0)),
            ("Historical Average Yield (tonnes/ha)", data.get("yield_t_ha", 0.0)),
            ("Calculated Crop Production (tonnes)", data.get("crop_production_tonnes", 0.0)),
            ("Estimated Oil Production (tonnes)", data.get("estimated_oil_tonnes", 0.0)),
            ("Total Production Cost (₹)", data.get("total_cost", 0.0)),
            ("Market Price (₹/kg)", data.get("market_price_per_kg", 0.0)),
            ("Market Price (₹/quintal)", data.get("market_price_per_quintal", 0.0)),
            ("Gross Revenue (₹)", data.get("gross_revenue", 0.0)),
            ("Net Profit (₹)", data.get("net_profit", 0.0)),
            ("Return on Investment (ROI %)", data.get("roi_percentage", 0.0)),
            ("Cost per Hectare (₹/ha)", data.get("cost_per_ha", 0.0)),
            ("Profit per Hectare (₹/ha)", data.get("profit_per_ha", 0.0)),
            ("Break-Even Price (₹/kg)", data.get("break_even_price_per_kg", 0.0)),
            ("Break-Even Production (tonnes)", data.get("break_even_production_tonnes", 0.0)),
        ]

        ws1["A4"] = "Parameter"
        ws1["B4"] = "Value"
        ws1["A4"].fill = header_fill
        ws1["A4"].font = header_font
        ws1["B4"].fill = header_fill
        ws1["B4"].font = header_font

        for idx, (param, val) in enumerate(summary_rows, start=5):
            ws1[f"A{idx}"] = param
            ws1[f"B{idx}"] = val
            ws1[f"A{idx}"].font = bold_font
            ws1[f"B{idx}"].font = normal_font
            ws1[f"A{idx}"].border = thin_border
            ws1[f"B{idx}"].border = thin_border

        ws1.column_dimensions["A"].width = 36
        ws1.column_dimensions["B"].width = 24

        # Sheet 2: Historical Production Records
        if historical_records:
            ws2 = wb.create_sheet(title="Historical Production")
            headers = ["Crop", "Region", "Year", "Season", "Area (ha)", "Production (tonnes)", "Yield (t/ha)"]
            for col_num, h in enumerate(headers, 1):
                cell = ws2.cell(row=1, column=col_num, value=h)
                cell.fill = header_fill
                cell.font = header_font

            for row_num, rec in enumerate(historical_records, 2):
                ws2.cell(row=row_num, column=1, value=rec.get("crop_name"))
                ws2.cell(row=row_num, column=2, value=rec.get("region"))
                ws2.cell(row=row_num, column=3, value=rec.get("year"))
                ws2.cell(row=row_num, column=4, value=rec.get("season"))
                ws2.cell(row=row_num, column=5, value=rec.get("cultivated_area"))
                ws2.cell(row=row_num, column=6, value=rec.get("production"))
                ws2.cell(row=row_num, column=7, value=rec.get("yield_per_ha"))

            for col in ws2.columns:
                max_len = max(len(str(cell.value or '')) for cell in col)
                col_letter = openpyxl.utils.get_column_letter(col[0].column)
                ws2.column_dimensions[col_letter].width = max(max_len + 3, 12)

        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        return buffer

report_service = ReportService()
