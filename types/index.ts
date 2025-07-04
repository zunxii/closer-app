export const defaultRow = {
    creator_name: "",
    instagram_link: "",
    mail_id: "",
    contact_no: "",
};

export interface Creator {
    creator_name: string;
    instagram_link: string;
    mail_id: string;
    contact_no: string;
    instagram_username?: string;
}
