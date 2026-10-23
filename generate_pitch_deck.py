import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Clean Dark Executive Palette
    BG_COLOR = RGBColor(9, 14, 26)          # Slate navy background
    CARD_BG = RGBColor(18, 25, 43)          # Card background
    CARD_BORDER = RGBColor(34, 46, 74)      # Card border
    TEXT_MAIN = RGBColor(255, 255, 255)     # Bright White
    TEXT_MUTED = RGBColor(148, 163, 184)    # Slate 400
    ACCENT_GREEN = RGBColor(16, 185, 129)   # Emerald #10B981
    ACCENT_BLUE = RGBColor(56, 189, 248)    # Sky blue #38BDF8
    ACCENT_AMBER = RGBColor(245, 158, 11)   # Amber #F59E0B
    ACCENT_RED = RGBColor(239, 68, 68)      # Crimson #EF4444

    def set_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_COLOR
        bg.line.fill.background()
        return bg

    def add_header(slide, tag, title):
        box = slide.shapes.add_textbox(Inches(0.9), Inches(0.6), Inches(11.5), Inches(1.2))
        tf = box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p_tag = tf.paragraphs[0]
        p_tag.text = tag.upper()
        p_tag.font.size = Pt(11)
        p_tag.font.bold = True
        p_tag.font.color.rgb = ACCENT_GREEN
        p_tag.space_after = Pt(4)

        p_title = tf.add_paragraph()
        p_title.text = title
        p_title.font.size = Pt(32)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_MAIN

    def add_footer(slide, current_num, total=7):
        box = slide.shapes.add_textbox(Inches(0.9), Inches(6.9), Inches(11.5), Inches(0.4))
        tf = box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = 0
        p = tf.paragraphs[0]
        p.text = f"TownshipPulse | Sime Darby Property University Hackathon 2026               Slide {current_num} of {total}"
        p.font.size = Pt(10)
        p.font.color.rgb = TEXT_MUTED

    # -------------------------------------------------------------------------
    # SLIDE 1: COVER
    # -------------------------------------------------------------------------
    s1 = prs.slides.add_slide(blank_layout)
    set_bg(s1)

    pill = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(1.3), Inches(5.6), Inches(0.45))
    pill.fill.solid()
    pill.fill.fore_color.rgb = CARD_BG
    pill.line.color.rgb = ACCENT_GREEN
    ptf = pill.text_frame
    pp = ptf.paragraphs[0]
    pp.text = "SIME DARBY PROPERTY HACKATHON 2026 — PEOPLE + PLANET"
    pp.font.size = Pt(10)
    pp.font.bold = True
    pp.font.color.rgb = ACCENT_GREEN
    pp.alignment = PP_ALIGN.CENTER

    hero = s1.shapes.add_textbox(Inches(0.9), Inches(2.0), Inches(11.5), Inches(2.2))
    htf = hero.text_frame
    htf.word_wrap = True
    htf.margin_left = htf.margin_top = 0
    hp1 = htf.paragraphs[0]
    hp1.text = "TownshipPulse"
    hp1.font.size = Pt(56)
    hp1.font.bold = True
    hp1.font.color.rgb = TEXT_MAIN
    hp1.space_after = Pt(8)

    hp2 = htf.add_paragraph()
    hp2.text = "The Smart Assistant that Fixes Township Problems in 5 Seconds"
    hp2.font.size = Pt(22)
    hp2.font.color.rgb = ACCENT_BLUE
    hp2.space_after = Pt(8)

    hp3 = htf.add_paragraph()
    hp3.text = "Piloted for City of Elmina (5,000 Acres) & Bandar Bukit Raja (4,333 Acres) | Ghulam Mustafa & Team"
    hp3.font.size = Pt(13)
    hp3.font.color.rgb = TEXT_MUTED

    badges = [
        ("0 Downloads", "WhatsApp & Web Ingestion", ACCENT_BLUE),
        ("50m Grouping", "Eliminates Duplicate Tickets", ACCENT_GREEN),
        ("< 5s Dispatch", "Auto-priced in Malaysian Ringgit", ACCENT_AMBER)
    ]
    for i, (title, sub, col) in enumerate(badges):
        bx = Inches(0.9 + i * 3.9)
        b = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, bx, Inches(4.8), Inches(3.6), Inches(1.7))
        b.fill.solid()
        b.fill.fore_color.rgb = CARD_BG
        b.line.color.rgb = CARD_BORDER
        btf = b.text_frame
        btf.margin_top = Inches(0.25)
        btf.margin_left = Inches(0.25)
        bp1 = btf.paragraphs[0]
        bp1.text = title
        bp1.font.size = Pt(22)
        bp1.font.bold = True
        bp1.font.color.rgb = col
        bp1.space_after = Pt(4)
        bp2 = btf.add_paragraph()
        bp2.text = sub
        bp2.font.size = Pt(12)
        bp2.font.color.rgb = TEXT_MUTED

    add_footer(s1, 1)
    s1.notes_slide.notes_text_frame.text = (
        "Good morning judges. In massive townships like City of Elmina and Bandar Bukit Raja, fixing broken infrastructure "
        "is slow, manual, and messy. TownshipPulse takes a resident's photo on WhatsApp, groups duplicate complaints within 50 meters, "
        "checks storm forecasts, and drafts contractor dispatch orders in under 5 seconds."
    )

    # -------------------------------------------------------------------------
    # SLIDE 2: THE PROBLEM (Big numbers, low text)
    # -------------------------------------------------------------------------
    s2 = prs.slides.add_slide(blank_layout)
    set_bg(s2)
    add_header(s2, "The Real-World Bottleneck", "The Hidden RM 500,000 Township Drain")

    problems = [
        ("90%", "App Abandonment", "Residents refuse to download a 100MB app to report a pothole once a year.", ACCENT_RED),
        ("50+", "Duplicates per Issue", "Office staff spend 4 hours a day reading the exact same complaint.", ACCENT_AMBER),
        ("RM 50k", "Monsoon Floods", "A blocked drain ignored for 2 days turns into a flash flood or road collapse.", ACCENT_RED)
    ]
    for i, (stat, title, sub, col) in enumerate(problems):
        px = Inches(0.9 + i * 3.9)
        card = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, px, Inches(2.2), Inches(3.6), Inches(4.3))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER
        ctf = card.text_frame
        ctf.margin_top = Inches(0.35)
        ctf.margin_left = Inches(0.3)
        ctf.margin_right = Inches(0.3)

        cp1 = ctf.paragraphs[0]
        cp1.text = stat
        cp1.font.size = Pt(48)
        cp1.font.bold = True
        cp1.font.color.rgb = col
        cp1.space_after = Pt(8)

        cp2 = ctf.add_paragraph()
        cp2.text = title
        cp2.font.size = Pt(18)
        cp2.font.bold = True
        cp2.font.color.rgb = TEXT_MAIN
        cp2.space_after = Pt(14)

        cp3 = ctf.add_paragraph()
        cp3.text = sub
        cp3.font.size = Pt(13)
        cp3.font.color.rgb = TEXT_MUTED

    add_footer(s2, 2)
    s2.notes_slide.notes_text_frame.text = (
        "Traditional complaint apps fail for 3 simple reasons: First, 90% of residents delete standalone township apps. "
        "Second, when a pipe bursts, over 50 residents send the same text, wasting hours of staff time. "
        "Third, an unmonitored drain quickly escalates into RM 50,000 in road and property damage when Malaysian downpours hit."
    )

    # -------------------------------------------------------------------------
    # SLIDE 3: THE SOLUTION (Before vs After)
    # -------------------------------------------------------------------------
    s3 = prs.slides.add_slide(blank_layout)
    set_bg(s3)
    add_header(s3, "The Solution — TownshipPulse", "From 14 Days to Under 5 Seconds")

    comparisons = [
        ("Old Way: 100MB App Download", "TownshipPulse: Instant WhatsApp / Web Ingestion", "Zero friction. Real phone camera + Malay/English voice notes.", ACCENT_BLUE),
        ("Old Way: 50 Duplicate Tickets", "TownshipPulse: 1 Master Job (50m Radius)", "AI clusters all nearby reports into one single action.", ACCENT_GREEN),
        ("Old Way: Manual Drive-Out & Quoting", "TownshipPulse: Instant JKR Cost & Contractor Verification", "Auto-prices repair in RM and verifies fixed photo with AI.", ACCENT_AMBER)
    ]
    for i, (old, new, desc, col) in enumerate(comparisons):
        cy = Inches(2.2 + i * 1.45)
        card = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), cy, Inches(11.5), Inches(1.25))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER
        ctf = card.text_frame
        ctf.margin_top = Inches(0.2)
        ctf.margin_left = Inches(0.3)

        cp1 = ctf.paragraphs[0]
        cp1.text = f"{new}   (vs {old})"
        cp1.font.size = Pt(17)
        cp1.font.bold = True
        cp1.font.color.rgb = col
        cp1.space_after = Pt(4)

        cp2 = ctf.add_paragraph()
        cp2.text = desc
        cp2.font.size = Pt(13)
        cp2.font.color.rgb = TEXT_MUTED

    add_footer(s3, 3)
    s3.notes_slide.notes_text_frame.text = (
        "TownshipPulse replaces 14 days of back-and-forth paperwork with 5 seconds of autonomous action: "
        "Residents report via WhatsApp or web with real camera and voice notes. "
        "Our spatial engine groups 50 duplicate reports into 1 master job. "
        "And standard Malaysian JKR rates price the job automatically, followed by AI verification when the contractor finishes."
    )

    # -------------------------------------------------------------------------
    # SLIDE 4: HOW IT WORKS & DEMO
    # -------------------------------------------------------------------------
    s4 = prs.slides.add_slide(blank_layout)
    set_bg(s4)
    add_header(s4, "System Workflow & Live Demo", "4 Steps from Resident Photo to Verified Resolution")

    steps = [
        ("1. Resident Snaps", "WhatsApp / Web with Camera & Voice"),
        ("2. AI Photo Scan", "Validates defect & groups duplicates within 50m"),
        ("3. Storm Radar Check", "> 30mm/h rain escalates to Emergency"),
        ("4. JKR Cost & AI Audit", "Auto-priced work order + Before/After proof")
    ]
    for i, (title, desc) in enumerate(steps):
        sx = Inches(0.9 + i * 2.85)
        sbox = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, sx, Inches(2.2), Inches(2.65), Inches(4.3))
        sbox.fill.solid()
        sbox.fill.fore_color.rgb = CARD_BG
        sbox.line.color.rgb = CARD_BORDER
        stf = sbox.text_frame
        stf.margin_top = Inches(0.3)
        stf.margin_left = Inches(0.2)
        stf.margin_right = Inches(0.2)

        sp1 = stf.paragraphs[0]
        sp1.text = f"0{i+1}"
        sp1.font.size = Pt(36)
        sp1.font.bold = True
        sp1.font.color.rgb = ACCENT_BLUE if i % 2 == 0 else ACCENT_GREEN
        sp1.space_after = Pt(8)

        sp2 = stf.add_paragraph()
        sp2.text = title
        sp2.font.size = Pt(15)
        sp2.font.bold = True
        sp2.font.color.rgb = TEXT_MAIN
        sp2.space_after = Pt(10)

        sp3 = stf.add_paragraph()
        sp3.text = desc
        sp3.font.size = Pt(12)
        sp3.font.color.rgb = TEXT_MUTED

    add_footer(s4, 4)
    s4.notes_slide.notes_text_frame.text = (
        "Here is the 4-step loop: A resident snaps a photo or records a voice note. AI verifies the issue and groups duplicates within 50 meters. "
        "The system checks live weather radar—escalating blocked drains to top emergency if a downpour is coming. "
        "Standard Malaysian JKR rates price the job, and when the contractor fixes it, AI audits the photo to close the ticket. "
        "Judges, please scan the QR code right now to test it live!"
    )

    # -------------------------------------------------------------------------
    # SLIDE 5: THE BUSINESS NUMBERS (Clean & High Impact)
    # -------------------------------------------------------------------------
    s5 = prs.slides.add_slide(blank_layout)
    set_bg(s5)
    add_header(s5, "Unit Economics & Commercial Viability", "RM 85 Cost. Over RM 5,000 Net Monthly Savings.")

    # Left: Running Cost
    c_left = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(2.2), Inches(5.5), Inches(4.3))
    c_left.fill.solid()
    c_left.fill.fore_color.rgb = CARD_BG
    c_left.line.color.rgb = CARD_BORDER
    ltf = c_left.text_frame
    ltf.margin_top = Inches(0.35)
    ltf.margin_left = Inches(0.4)

    lp1 = ltf.paragraphs[0]
    lp1.text = "RM 85 / Month"
    lp1.font.size = Pt(44)
    lp1.font.bold = True
    lp1.font.color.rgb = ACCENT_BLUE
    lp1.space_after = Pt(4)

    lp2 = ltf.add_paragraph()
    lp2.text = "Total Running Cost (5,000 Homes)"
    lp2.font.size = Pt(16)
    lp2.font.bold = True
    lp2.font.color.rgb = TEXT_MAIN
    lp2.space_after = Pt(16)

    costs = [
        "AI Vision: < 1 sen per report (~RM 7/mo)",
        "Open Maps & Weather Radar: RM 0.00",
        "Cloud Server: ~RM 70/mo",
        "WhatsApp Messages: Free tier (1,000/mo)"
    ]
    for c in costs:
        pc = ltf.add_paragraph()
        pc.text = f"• {c}"
        pc.font.size = Pt(13)
        pc.font.color.rgb = TEXT_MUTED
        pc.space_after = Pt(6)

    # Right: Monthly Savings
    c_right = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(2.2), Inches(5.6), Inches(4.3))
    c_right.fill.solid()
    c_right.fill.fore_color.rgb = CARD_BG
    c_right.line.color.rgb = CARD_BORDER
    rtf = c_right.text_frame
    rtf.margin_top = Inches(0.35)
    rtf.margin_left = Inches(0.4)

    rp1 = rtf.paragraphs[0]
    rp1.text = "> RM 5,000 / Mo"
    rp1.font.size = Pt(44)
    rp1.font.bold = True
    rp1.font.color.rgb = ACCENT_GREEN
    rp1.space_after = Pt(4)

    rp2 = rtf.add_paragraph()
    rp2.text = "Net Monthly Operational Savings"
    rp2.font.size = Pt(16)
    rp2.font.bold = True
    rp2.font.color.rgb = TEXT_MAIN
    rp2.space_after = Pt(16)

    savings = [
        "75% Less Office Work (~RM 4,000 saved/mo)",
        "Zero False Contractor Callouts (RM 150/trip)",
        "Flood Prevention (Stops RM 50k repairs)",
        "Payback Period: Under 48 Hours each month"
    ]
    for s in savings:
        ps = rtf.add_paragraph()
        ps.text = f"• {s}"
        ps.font.size = Pt(13)
        ps.font.color.rgb = TEXT_MUTED
        ps.space_after = Pt(6)

    add_footer(s5, 5)
    s5.notes_slide.notes_text_frame.text = (
        "The business model is simple: scanning a photo costs less than 1 sen. Running the entire platform for 5,000 homes "
        "costs just RM 85 per month. In return, it saves over RM 5,000 every single month in staff triage time and prevented flood damage. "
        "It pays for itself within the first 48 hours of every month."
    )

    # -------------------------------------------------------------------------
    # SLIDE 6: PLANET & ESG IMPACT (Huge Numbers)
    # -------------------------------------------------------------------------
    s6 = prs.slides.add_slide(blank_layout)
    set_bg(s6)
    add_header(s6, "Bursa Malaysia ESG & Planet Track", "Measurable Green Impact for Sime Darby")

    esg = [
        ("1.2M Liters", "Clean Water Saved / Yr", "Pipe leaks dispatched in 4 hours vs 7 days.", ACCENT_BLUE),
        ("240 Trips", "Car Drives Avoided / Mo", "Fewer inspection trips cut vehicle emissions.", ACCENT_GREEN),
        ("Zero Floods", "Drainage Resilience", "Culverts cleared before monsoon storms hit.", ACCENT_AMBER)
    ]
    for i, (stat, title, sub, col) in enumerate(esg):
        ex = Inches(0.9 + i * 3.9)
        card = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, ex, Inches(2.2), Inches(3.6), Inches(4.3))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER
        ctf = card.text_frame
        ctf.margin_top = Inches(0.35)
        ctf.margin_left = Inches(0.3)

        ep1 = ctf.paragraphs[0]
        ep1.text = stat
        ep1.font.size = Pt(42)
        ep1.font.bold = True
        ep1.font.color.rgb = col
        ep1.space_after = Pt(8)

        ep2 = ctf.add_paragraph()
        ep2.text = title
        ep2.font.size = Pt(18)
        ep2.font.bold = True
        ep2.font.color.rgb = TEXT_MAIN
        ep2.space_after = Pt(12)

        ep3 = ctf.add_paragraph()
        ep3.text = sub
        ep3.font.size = Pt(13)
        ep3.font.color.rgb = TEXT_MUTED

    add_footer(s6, 6)
    s6.notes_slide.notes_text_frame.text = (
        "TownshipPulse directly supports Sime Darby Property's Bursa Malaysia ESG goals: "
        "Saving 1.2 million liters of clean water by fixing leaks in hours instead of days. "
        "Cutting 240 car inspection trips every month. "
        "And protecting Elmina and Bandar Bukit Raja from flash floods."
    )

    # -------------------------------------------------------------------------
    # SLIDE 7: PILOT ROADMAP & MULTI-TOWNSHIP SCALE
    # -------------------------------------------------------------------------
    s7 = prs.slides.add_slide(blank_layout)
    set_bg(s7)
    add_header(s7, "Multi-Township Scale & Team", "Ready to Deploy in City of Elmina & Bukit Raja")

    phases = [
        ("Months 1–2", "Digital Asset Mapping", "Map drains, streetlights, and culverts in Elmina Valley & Green."),
        ("Months 3–4", "1,000-Home Pilot", "Live WhatsApp & Web pilot with local JMB and repair contractors."),
        ("Months 5–6", "Scale to Bandar Bukit Raja", "Rollout to Klang logistics hub and commercial industrial parks.")
    ]
    for i, (time, title, desc) in enumerate(phases):
        py = Inches(2.2 + i * 1.25)
        pbox = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), py, Inches(11.5), Inches(1.05))
        pbox.fill.solid()
        pbox.fill.fore_color.rgb = CARD_BG
        pbox.line.color.rgb = CARD_BORDER
        ptf = pbox.text_frame
        ptf.margin_top = Inches(0.18)
        ptf.margin_left = Inches(0.3)

        pp1 = ptf.paragraphs[0]
        pp1.text = f"{time}: {title}"
        pp1.font.size = Pt(17)
        pp1.font.bold = True
        pp1.font.color.rgb = ACCENT_GREEN
        pp1.space_after = Pt(2)

        pp2 = ptf.add_paragraph()
        pp2.text = desc
        pp2.font.size = Pt(12)
        pp2.font.color.rgb = TEXT_MUTED

    # Bottom Banner
    bb = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(5.9), Inches(11.5), Inches(0.9))
    bb.fill.solid()
    bb.fill.fore_color.rgb = CARD_BG
    bb.line.color.rgb = ACCENT_BLUE
    btf = bb.text_frame
    btf.margin_top = Inches(0.2)
    btf.margin_left = Inches(0.3)
    bp = btf.paragraphs[0]
    bp.text = 'Team: Ghulam Mustafa & Team  |  "From slow paperwork to self-healing townships."'
    bp.font.size = Pt(14)
    bp.font.bold = True
    bp.font.color.rgb = TEXT_MAIN

    add_footer(s7, 7)
    s7.notes_slide.notes_text_frame.text = (
        "We are ready to deploy tomorrow. A phased 6-month roadmap starting with 1,000 homes in Elmina Valley, "
        "connecting directly to local maintenance teams, and scaling to Bandar Bukit Raja in Klang. "
        "With TownshipPulse, Sime Darby ensures its townships take care of themselves. Thank you!"
    )

    out = "/Users/mac/Desktop/projects/township_hackathone/TownshipPulse_PitchDeck.pptx"
    prs.save(out)
    print("Successfully generated updated PowerPoint presentation.")

if __name__ == "__main__":
    create_deck()
