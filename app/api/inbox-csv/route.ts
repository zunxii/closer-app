import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as Papa from 'papaparse';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId');

    if (!campaignId) {
        return new NextResponse('Missing campaignId', { status: 400 });
    }

    const API_URL = 'https://api.instantly.ai/api/v2/emails';
    const API_KEY = process.env.INSTANTLY_API_KEY;

    if (!API_KEY) {
        return new NextResponse('Missing INSTANTLY_API_KEY in environment variables', { status: 500 });
    }

    let allEmails: any[] = [];
    let hasMore = true;
    let startingAfter: string | null = null;

    // Fetch all pages of emails until no more results
    while (hasMore) {
        try {
            const params: any = {
                limit: 100,
                campaign_id: campaignId,
                email_type: 'received',
                sort_order: 'asc',
            };
            if (startingAfter) {
                params.starting_after = startingAfter;
            }

            const response = await axios.get(API_URL, {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                },
                params,
            });

            const items = response.data.items || [];
            if (items.length === 0) break;

            allEmails.push(...items);

            // Set startingAfter to the timestamp of last email for next page
            startingAfter = items[items.length - 1].created_at;

            // Continue if full page returned, else stop
            hasMore = items.length === 100;
        } catch (error) {
            console.error('Error fetching emails:', error);
            return new NextResponse('Failed to fetch emails from Instantly API', { status: 500 });
        }
    }

    // Extract Instagram username - improved logic:
    const extractUsername = (subject: string, body: string): string => {
        // 1. Try original regex from subject
        const regexSubject = /Re:\s([\w\d._]+),|^([\w\d._]+),/;
        let match = subject.match(regexSubject);
        if (match) return match[1] || match[2] || '';

        // 2. If not found, look for typical instagram username pattern anywhere in subject or body
        // Instagram usernames typically: letters, digits, dots, underscores (3-30 chars)
        const instaRegex = /([a-zA-Z0-9._]{3,30})/g;

        // Combine subject and first 500 chars of body for performance
        const combinedText = subject + " " + (body.slice(0, 500) || "");

        const candidates = combinedText.match(instaRegex) || [];

        // Filter candidates - e.g. ignore common words, numbers-only, or too short
        const filtered = candidates.filter((c) => {
            if (!c) return false;
            if (c.length < 3) return false;
            if (/^\d+$/.test(c)) return false; // all digits no
            if (['re', 'fw', 'fwd', 'paid', 'brand', 'collab', 'confirmation', 'for', 'the'].includes(c.toLowerCase()))
                return false;
            return true;
        });

        // Return first filtered candidate or empty string
        return filtered.length > 0 ? filtered[0] : '';
    };

    // Extract first phone number from body text
    const extractPhone = (text: string): string => {
        const phoneRegex = /\+?\d{1,3}[-.\s]?\d{3,5}[-.\s]?\d{3,5}[-.\s]?\d{0,5}/g;
        const matches = text.match(phoneRegex);
        return matches?.[0] || '';
    };

    // Prepare CSV data array with headers (USERNAME, PHONE)
    const finalData = [['USERNAME', 'PHONE']];

    // Push each email's data, forcing text CSV format with ="" trick
    for (const email of allEmails) {
        const subject = email.subject || '';
        const bodyText = email.body?.text || '';

        const username = extractUsername(subject, bodyText);
        const phone = extractPhone(bodyText);

        finalData.push([
            username ? `="${username}"` : '',
            phone ? `="${phone}"` : '',
        ]);
    }

    // Convert array to CSV string
    const csv = Papa.unparse(finalData);

    // Return CSV file as response with correct headers
    return new NextResponse(csv, {
        status: 200,
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="inbox_data.csv"',
        },
    });
}
