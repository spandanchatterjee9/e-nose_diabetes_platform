import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

class PDFService:
    @staticmethod
    def generate_patient_report(assessment_data: dict) -> io.BytesIO:
        """
        Generates a professional clinical PDF diagnostic report for a patient assessment.
        Returns a BytesIO buffer containing the PDF binary data.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            leftMargin=36,
            rightMargin=36,
            topMargin=40,
            bottomMargin=40
        )
        
        styles = getSampleStyleSheet()
        
        # Color Palette - Healthcare Theme (Dark blue, teal accent, light gray grids)
        primary_color = colors.HexColor('#1e1b4b')  # Dark Navy
        secondary_color = colors.HexColor('#0d9488')  # Teal Accent
        text_color = colors.HexColor('#334155')  # Slate Text
        bg_light = colors.HexColor('#f8fafc')  # Background Soft White
        
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=20,
            textColor=primary_color,
            spaceAfter=5,
            alignment=0
        )
        
        subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            textColor=colors.HexColor('#64748b'),
            spaceAfter=20
        )
        
        section_style = ParagraphStyle(
            'SectionHeader',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=13,
            textColor=primary_color,
            spaceBefore=12,
            spaceAfter=6,
            keepWithNext=True
        )
        
        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=13,
            textColor=text_color,
            spaceAfter=8
        )
        
        bold_body_style = ParagraphStyle(
            'BoldBody',
            parent=body_style,
            fontName='Helvetica-Bold'
        )
        
        rec_style = ParagraphStyle(
            'Recommendation',
            parent=body_style,
            fontSize=10.5,
            leading=14,
            textColor=colors.HexColor('#0f172a'),
            backColor=colors.HexColor('#f0fdf4'),
            borderColor=colors.HexColor('#bbf7d0'),
            borderWidth=1,
            borderPadding=8,
            spaceBefore=10,
            spaceAfter=15
        )
        
        # Set background for warning categories
        risk_category = assessment_data.get('risk_category', 'Low')
        if risk_category == 'High':
            rec_style.backColor = colors.HexColor('#fef2f2')
            rec_style.borderColor = colors.HexColor('#fecaca')
        elif risk_category == 'Moderate':
            rec_style.backColor = colors.HexColor('#fffbeb')
            rec_style.borderColor = colors.HexColor('#fde68a')

        story = []
        
        # --- HEADER SECTION ---
        story.append(Paragraph("E-NOSE DIABETES SCREENING SYSTEM", title_style))
        story.append(Paragraph(f"Clinical Assessment Report  |  Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", subtitle_style))
        story.append(Spacer(1, 5))
        
        # --- PATIENT INFO TABLE ---
        story.append(Paragraph("Patient Information", section_style))
        pi = assessment_data.get('patient_info', {})
        patient_table_data = [
            [
                Paragraph("<b>Patient ID:</b>", body_style), Paragraph(pi.get('patient_id', 'N/A'), body_style),
                Paragraph("<b>Date of Assessment:</b>", body_style), Paragraph(assessment_data.get('timestamp', 'N/A')[:10], body_style)
            ],
            [
                Paragraph("<b>Full Name:</b>", body_style), Paragraph(pi.get('name', 'N/A'), body_style),
                Paragraph("<b>Gender / Age:</b>", body_style), Paragraph(f"{pi.get('gender', 'N/A')} / {pi.get('age', 'N/A')} yrs", body_style)
            ],
            [
                Paragraph("<b>Height:</b>", body_style), Paragraph(f"{pi.get('height', 0.0):.2f} m", body_style),
                Paragraph("<b>Weight:</b>", body_style), Paragraph(f"{pi.get('weight', 0.0):.1f} kg", body_style)
            ],
            [
                Paragraph("<b>Body Mass Index (BMI):</b>", body_style), Paragraph(f"{assessment_data.get('bmi', 0.0):.1f} (Normal range: 18.5 - 24.9)", bold_body_style),
                Paragraph("", body_style), Paragraph("", body_style)
            ]
        ]
        t_pat = Table(patient_table_data, colWidths=[130, 140, 130, 140])
        t_pat.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
            ('BACKGROUND', (0,0), (-1,-1), bg_light),
            ('PADDING', (0,0), (-1,-1), 6),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        story.append(t_pat)
        story.append(Spacer(1, 15))
        
        # --- DIAGNOSTIC SUMMARY ---
        story.append(Paragraph("Diagnostic Screening Summary", section_style))
        prediction = assessment_data.get('prediction', 'Normal')
        confidence = assessment_data.get('confidence', 0.0)
        risk_pct = assessment_data.get('risk_percentage', 0.0)
        
        # Coloring based on risk
        risk_color = '#10b981'  # Green
        if risk_category == 'High':
            risk_color = '#ef4444'  # Red
        elif risk_category == 'Moderate':
            risk_color = '#f59e0b'  # Amber
            
        summary_table_data = [
            [
                Paragraph("<b>Classification Result:</b>", body_style), 
                Paragraph(f"<font color='{risk_color}'><b>{prediction.upper()}</b></font>", bold_body_style)
            ],
            [
                Paragraph("<b>Screening Risk Score:</b>", body_style), 
                Paragraph(f"<font color='{risk_color}'><b>{risk_pct:.1f}%</b></font>", bold_body_style)
            ],
            [
                Paragraph("<b>Risk Classification:</b>", body_style), 
                Paragraph(f"<font color='{risk_color}'><b>{risk_category.upper()} RISK</b></font>", bold_body_style)
            ],
            [
                Paragraph("<b>Model Confidence:</b>", body_style), 
                Paragraph(f"{confidence*100:.1f}%", body_style)
            ]
        ]
        t_sum = Table(summary_table_data, colWidths=[180, 360])
        t_sum.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
            ('PADDING', (0,0), (-1,-1), 6),
            ('BACKGROUND', (0,0), (0,-1), bg_light),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        story.append(t_sum)
        story.append(Spacer(1, 15))
        
        # --- TELEMETRY READINGS ---
        story.append(Paragraph("Electronic Nose (E-Nose) Sensor Telemetry", section_style))
        sd = assessment_data.get('sensor_data', {})
        sensor_table_data = [
            ["Sensor Channel", "Measurement Value", "Description / Targeted Gas Species"],
            ["TGS 2600", f"{sd.get('TGS2600', 0.0):.4f}", "General air contaminants / Hydrogen / Carbon Monoxide"],
            ["TGS 2602", f"{sd.get('TGS2602', 0.0):.4f}", "Organic solvent vapors / Odorous gases (Hydrogen Sulfide, Ammonia)"],
            ["TGS 2610", f"{sd.get('TGS2610', 0.0):.4f}", "Butane / LP Gas / High sensitivity correlation index"],
            ["TGS 2611", f"{sd.get('TGS2611', 0.0):.4f}", "Methane / Natural Gas / Hydrocarbon traces"],
            ["TGS 2620", f"{sd.get('TGS2620', 0.0):.4f}", "Alcohol vapors (Ethanol) / Solvent molecules"],
            ["TGS 826",  f"{sd.get('TGS826', 0.0):.4f}",  "Ammonia vapors / Highly specific nitrogenous traces"]
        ]
        t_sens = Table(sensor_table_data, colWidths=[120, 130, 290])
        t_sens.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#475569')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor('#f8fafc'), colors.white]),
            ('FONTSIZE', (0,0), (-1,-1), 9),
            ('PADDING', (0,0), (-1,-1), 5),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        story.append(t_sens)
        story.append(Spacer(1, 15))
        
        # --- RECOMMENDATION BOX ---
        story.append(Paragraph("Clinical Interpretations & Recommendations", section_style))
        rec_text = assessment_data.get('clinical_recommendation', 'No recommendation available.')
        story.append(Paragraph(f"<b>Notice:</b> {rec_text}", rec_style))
        
        # --- SYSTEM METADATA ---
        story.append(Paragraph("System & Validation Metadata", section_style))
        meta_table_data = [
            [
                Paragraph("<b>Active AI Model Version:</b>", body_style), Paragraph(assessment_data.get('model_version', 'Random Forest Model (v1.0.0)'), body_style),
                Paragraph("<b>Data Storage ID:</b>", body_style), Paragraph(assessment_data.get('assessment_id', 'N/A'), body_style)
            ]
        ]
        t_meta = Table(meta_table_data, colWidths=[150, 150, 110, 130])
        t_meta.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
            ('PADDING', (0,0), (-1,-1), 4),
            ('FONTSIZE', (0,0), (-1,-1), 8),
            ('BACKGROUND', (0,0), (-1,-1), bg_light),
        ]))
        story.append(t_meta)
        story.append(Spacer(1, 20))
        
        # --- DISCLAIMER ---
        disclaimer_text = (
            "<i>Disclaimer: This report is generated programmatically by an Electronic Nose (E-Nose) gas array classification model "
            "and is designed for rapid preliminary screening. This output does NOT substitute a standard clinical diagnostic test "
            "(such as HbA1c or Oral Glucose Tolerance Tests). Consult a certified medical practitioner to confirm diabetes diagnoses.</i>"
        )
        story.append(Paragraph(disclaimer_text, ParagraphStyle('Disclaimer', parent=body_style, fontSize=7.5, leading=10, textColor=colors.HexColor('#94a3b8'))))
        
        doc.build(story)
        buffer.seek(0)
        return buffer
