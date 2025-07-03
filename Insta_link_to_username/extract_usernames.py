import re
import sys
import json

def extract_instagram_username(line):
    line = line.strip()
    if not line:
        return ""
    
    match = re.search(r"instagram\.com(?:/stories)?/([A-Za-z0-9_.]+)", line)
    if match:
        return match.group(1).lower()
    
    if re.fullmatch(r"[A-Za-z0-9_.]+", line):
        return line.lower()
    
    return ""

def extract_from_file(input_path, output_path):
    usernames = set()
    with open(input_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = line.split(",")[0]
            username = extract_instagram_username(parts)
            if username:
                usernames.add(username)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(list(usernames), f, indent=2)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python extract_usernames.py <input_path> <output_path>")
        sys.exit(1)

    extract_from_file(sys.argv[1], sys.argv[2])
    print("Usernames extracted successfully")
