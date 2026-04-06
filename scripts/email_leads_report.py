"""
Email AcroHavura leads report with clickable WhatsApp links.
Usage: python scripts/email_leads_report.py
"""
import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gmail_helpers import get_gmail_service, get_account_email, build_mime_message

# Load env vars for DB access
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

import urllib.request

def fetch_leads():
    """Fetch leads from pre-exported JSON (run get-leads.ts first) or use cached data."""
    leads_file = 'C:/Windows/Temp/leads.json'
    if not os.path.exists(leads_file):
        print(f"ERROR: {leads_file} not found. Run: npx tsx get-leads.ts")
        sys.exit(1)
    with open(leads_file, 'r', encoding='utf-8') as f:
        return json.load(f)


def make_wa_link(phone, name):
    """Create WhatsApp link with Hebrew message."""
    # Remove + and format for wa.me
    clean = phone.replace('+', '').replace('-', '').replace(' ', '')
    msg = f"היי {name}! ראיתי שמילאת את השאלון של אקרוחבורה 🤸 רציתי לשאול אם את/ה מעוניין/ת להצטרף לאתגר 30 הימים? אני שי, המדריך - אשמח לענות על כל שאלה!"
    encoded = urllib.request.quote(msg)
    return f"https://wa.me/{clean}?text={encoded}"


def build_html_report(leads):
    """Build HTML email with clickable WhatsApp links."""
    paid = [l for l in leads if l['paid']]
    not_paid = [l for l in leads if not l['paid']]

    fear_map = {'ready': 'מוכן/ה', 'not-good-enough': 'לא מספיק טוב/ה', 'socially-awkward': 'מביך עם זרים',
                'wont-commit': 'לא אתמיד', 'injury': 'פציעה'}
    exp_map = {'never': 'אפס', 'few-times': 'פעם-פעמיים', 'sometimes': 'לפעמים'}

    def lead_row(l):
        wa_link = make_wa_link(l['phone'], l['name'].split()[0])
        fear = fear_map.get(l.get('fear', ''), l.get('fear', ''))
        exp = exp_map.get(l.get('experience', ''), l.get('experience', ''))
        return f"""
        <tr style="border-bottom: 1px solid #333;">
            <td style="padding: 8px; font-weight: bold;">{l['name']}</td>
            <td style="padding: 8px;">{l['email']}</td>
            <td style="padding: 8px;"><a href="{wa_link}" style="color: #25D366; font-weight: bold;">{l['phone']}</a></td>
            <td style="padding: 8px;">{l.get('archetype', '')}</td>
            <td style="padding: 8px;">{exp}</td>
            <td style="padding: 8px;">{l.get('commitment', '')}/w</td>
            <td style="padding: 8px;">{fear}</td>
            <td style="padding: 8px;">{l.get('fitness', '')}</td>
            <td style="padding: 8px;">{l['date'][:10]}</td>
        </tr>"""

    paid_rows = ''.join(lead_row(l) for l in paid)
    unpaid_rows = ''.join(lead_row(l) for l in not_paid)

    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; background: #0a0a0a; color: #f5f5f5; padding: 20px;">
        <h1 style="color: #F472B6;">AcroHavura Leads Report</h1>
        <p>{len(leads)} leads total — {len(paid)} paid, {len(not_paid)} not yet paid</p>
        <p style="color: #999; font-size: 12px;">Phone numbers are clickable WhatsApp links with a Hebrew message asking them to join the challenge.</p>

        <h2 style="color: #22c55e; margin-top: 30px;">PAID ({len(paid)})</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr style="background: #1a1a1a; color: #F472B6;">
                <th style="padding: 8px; text-align: left;">Name</th>
                <th style="padding: 8px; text-align: left;">Email</th>
                <th style="padding: 8px; text-align: left;">WhatsApp</th>
                <th style="padding: 8px; text-align: left;">Type</th>
                <th style="padding: 8px; text-align: left;">Exp</th>
                <th style="padding: 8px; text-align: left;">Commit</th>
                <th style="padding: 8px; text-align: left;">Fear</th>
                <th style="padding: 8px; text-align: left;">Fitness</th>
                <th style="padding: 8px; text-align: left;">Date</th>
            </tr>
            {paid_rows}
        </table>

        <h2 style="color: #eab308; margin-top: 30px;">NOT YET PAID ({len(not_paid)})</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr style="background: #1a1a1a; color: #F472B6;">
                <th style="padding: 8px; text-align: left;">Name</th>
                <th style="padding: 8px; text-align: left;">Email</th>
                <th style="padding: 8px; text-align: left;">WhatsApp</th>
                <th style="padding: 8px; text-align: left;">Type</th>
                <th style="padding: 8px; text-align: left;">Exp</th>
                <th style="padding: 8px; text-align: left;">Commit</th>
                <th style="padding: 8px; text-align: left;">Fear</th>
                <th style="padding: 8px; text-align: left;">Fitness</th>
                <th style="padding: 8px; text-align: left;">Date</th>
            </tr>
            {unpaid_rows}
        </table>

        <p style="color: #666; font-size: 11px; margin-top: 30px;">Generated by AcroHavura CRM</p>
    </body>
    </html>
    """


def main():
    print("Fetching leads from DB...")
    leads = fetch_leads()
    paid = sum(1 for l in leads if l['paid'])
    print(f"Found {len(leads)} leads ({paid} paid)")

    print("Building HTML report...")
    html = build_html_report(leads)

    print("Sending email...")
    gmail = get_gmail_service('pelegs')
    from_email = get_account_email('pelegs')
    subject = f"AcroHavura Leads Report — {len(leads)} leads ({paid} paid)"
    message = build_mime_message(from_email, 'pelegs202@gmail.com', subject, html, html=True)
    sent = gmail.users().messages().send(userId='me', body=message).execute()
    print(f"Email sent! Message ID: {sent['id']}")


if __name__ == '__main__':
    main()
