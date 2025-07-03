import csv
import re

def extract_instagram_username(link):
    link = link.strip()
    if not link:
        return ""
    match = re.search(r"instagram\.com(?:/stories)?/([A-Za-z0-9_.]+)", link)
    if match:
        return match.group(1)
    if re.fullmatch(r"[A-Za-z0-9_.]+", link):
        return link
    return ""

# File paths
input_csv = "input.csv"
output_csv = "output_cleaned.csv"

with open(input_csv, mode='r', encoding='latin1') as infile, \
     open(output_csv, mode='w', encoding='utf-8', newline='') as outfile:

    reader = csv.reader(infile)
    writer = csv.writer(outfile)

    # Read the header
    header = next(reader)
    
    # Indexes of required fields (based on first few columns)
    try:
        creator_idx = header.index("creator_name")
        link_idx = header.index("instagram_link")
        contact_idx = header.index("contact_no")
        mail_idx = header.index("mail_id")
        username_idx = header.index("instagram_username")
    except ValueError as e:
        print("❌ Column missing in header:", e)
        exit(1)

    # Write new header
    writer.writerow(["creator_name", "instagram_link", "contact_no", "mail_id", "instagram_username"])

    for row in reader:
        if len(row) < max(creator_idx, link_idx, contact_idx, mail_idx, username_idx) + 1:
            continue  # Skip rows that are too short

        creator_name = row[creator_idx].strip()
        instagram_link = row[link_idx].strip()
        contact_no = row[contact_idx].strip()
        mail_id = row[mail_idx].strip()
        instagram_username = row[username_idx].strip()

        if not instagram_username:
            instagram_username = extract_instagram_username(instagram_link)

        writer.writerow([creator_name, instagram_link, contact_no, mail_id, instagram_username])

print("✅ Done. All rows processed and saved to:", output_csv)
