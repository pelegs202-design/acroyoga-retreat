"""Shared Gmail/Drive auth and message utilities for CLI tools."""
import os
import sys
import base64
import pickle
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

SCOPES = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/drive.file',
]

ACCOUNTS = {
    'pelegs': {
        'email': 'pelegs202@gmail.com',
        'token': os.path.join(SCRIPT_DIR, 'token.pickle'),  # Google OAuth token
    },
}

DEFAULT_ACCOUNT = 'pelegs'


def get_credentials(account=None):
    """Load credentials from pickle, refresh if expired."""
    account = account or DEFAULT_ACCOUNT
    acct = ACCOUNTS.get(account)
    if not acct:
        print(f"ERROR: Unknown account '{account}'. Available: {', '.join(ACCOUNTS)}")
        sys.exit(1)

    token_file = acct['token']
    if not os.path.exists(token_file):
        print(f"ERROR: No token found for '{account}'. Run gmail_auth.py first.")
        sys.exit(1)

    with open(token_file, 'rb') as f:
        creds = pickle.load(f)

    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
        with open(token_file, 'wb') as f:
            pickle.dump(creds, f)

    return creds


def get_gmail_service(account=None):
    """Build Gmail API service."""
    creds = get_credentials(account)
    return build('gmail', 'v1', credentials=creds)


def get_drive_service(account=None):
    """Build Drive API service."""
    creds = get_credentials(account)
    return build('drive', 'v3', credentials=creds)


def get_account_email(account=None):
    """Return the email address for an account."""
    account = account or DEFAULT_ACCOUNT
    acct = ACCOUNTS.get(account)
    return acct['email'] if acct else None


def extract_body(part):
    """Recursively extract text from a Gmail message payload."""
    text = ''
    if part.get('mimeType', '').startswith('text/'):
        data = part.get('body', {}).get('data', '')
        if data:
            text = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
    for sub_part in part.get('parts', []):
        text += extract_body(sub_part)
    return text


def find_attachments(part):
    """Recursively find attachments in a Gmail message payload."""
    attachments = []
    if part.get('filename'):
        attachments.append({
            'filename': part['filename'],
            'mimeType': part.get('mimeType', ''),
            'attachmentId': part.get('body', {}).get('attachmentId', ''),
            'size': part.get('body', {}).get('size', 0),
        })
    for sub_part in part.get('parts', []):
        attachments.extend(find_attachments(sub_part))
    return attachments


def get_message_details(gmail, msg_id):
    """Get full message details including body and attachments."""
    msg = gmail.users().messages().get(userId='me', id=msg_id, format='full').execute()
    headers = msg.get('payload', {}).get('headers', [])

    subject = next((h['value'] for h in headers if h['name'].lower() == 'subject'), '(no subject)')
    sender = next((h['value'] for h in headers if h['name'].lower() == 'from'), '')
    to = next((h['value'] for h in headers if h['name'].lower() == 'to'), '')
    date_str = next((h['value'] for h in headers if h['name'].lower() == 'date'), '')

    payload = msg.get('payload', {})
    body_text = extract_body(payload)
    attachments = find_attachments(payload)

    return {
        'id': msg_id,
        'threadId': msg.get('threadId', ''),
        'subject': subject,
        'sender': sender,
        'to': to,
        'date': date_str,
        'snippet': msg.get('snippet', ''),
        'body_text': body_text,
        'attachments': attachments,
        'labelIds': msg.get('labelIds', []),
    }


def search_messages(gmail, query, max_results=20):
    """Search Gmail messages with pagination support."""
    results_list = []
    page_token = None
    remaining = max_results

    while remaining > 0:
        batch_size = min(remaining, 100)
        results = gmail.users().messages().list(
            userId='me', q=query, pageToken=page_token, maxResults=batch_size
        ).execute()
        messages = results.get('messages', [])
        results_list.extend(messages)
        remaining -= len(messages)
        page_token = results.get('nextPageToken')
        if not page_token or not messages:
            break

    return results_list[:max_results]


def build_mime_message(from_email, to, subject, body, html=False, attachments=None):
    """Build a MIME message ready for Gmail API send."""
    if attachments:
        msg = MIMEMultipart('mixed')
        if html:
            msg.attach(MIMEText(body, 'html'))
        else:
            msg.attach(MIMEText(body, 'plain'))

        for filepath in attachments:
            if not os.path.exists(filepath):
                print(f"WARNING: Attachment not found: {filepath}")
                continue
            filename = os.path.basename(filepath)
            part = MIMEBase('application', 'octet-stream')
            with open(filepath, 'rb') as f:
                part.set_payload(f.read())
            encoders.encode_base64(part)
            part.add_header('Content-Disposition', f'attachment; filename="{filename}"')
            msg.attach(part)
    else:
        if html:
            msg = MIMEMultipart('alternative')
            msg.attach(MIMEText(body, 'html'))
        else:
            msg = MIMEText(body, 'plain')

    msg['to'] = to
    msg['from'] = from_email
    msg['subject'] = subject

    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode('utf-8')
    return {'raw': raw}


def download_attachment(gmail, msg_id, attachment_id):
    """Download a specific attachment, return raw bytes."""
    att_data = gmail.users().messages().attachments().get(
        userId='me', messageId=msg_id, id=attachment_id
    ).execute()
    return base64.urlsafe_b64decode(att_data['data'])
