"use server";

import { db } from "@/db";
import { leads } from "@/db/schema";
import { randomUUID } from "crypto";
import { Resend } from "resend";

export async function submitInquiry(formData: {
  name: string;
  phone: string;
  message?: string;
  voiceNote?: string | null;
  reference?: string | null;
}) {
  const chatToken = randomUUID();

  try {
    await db.insert(leads).values({
      name: formData.name,
      phone: formData.phone || null,
      message: formData.message || null,
      voiceNote: formData.voiceNote || null,
      reference: formData.reference || null,
      chatToken,
    });
  } catch (error) {
    console.error("[leads] DB insert failed:", error);
    return { success: false, chatToken: null };
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const chatUrl = `https://webistrydev.com/m/${chatToken}`;
      await resend.emails.send({
        from: "Webistry Leads <onboarding@resend.dev>",
        to: "sherif.ash93@gmail.com",
        subject: `🔔 طلب جديد من ${formData.name}`,
        html: `
          <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px;">
            <h2 style="color:#7c3aed;margin:0 0 20px;">طلب جديد من موقع Webistry</h2>
            <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;">
              <tr style="background:#7c3aed;color:#fff;">
                <td style="padding:12px 16px;font-weight:bold;">الاسم</td>
                <td style="padding:12px 16px;">${formData.name}</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;background:#f1f0ff;font-weight:bold;color:#4c1d95;">الهاتف</td>
                <td style="padding:12px 16px;background:#f1f0ff;">${formData.phone || "—"}</td>
              </tr>
              ${formData.reference ? `
              <tr style="background:#fff;">
                <td style="padding:12px 16px;font-weight:bold;color:#4c1d95;">المشروع</td>
                <td style="padding:12px 16px;">${formData.reference}</td>
              </tr>` : ""}
              <tr style="background:#f9f9f9;">
                <td style="padding:12px 16px;font-weight:bold;color:#4c1d95;vertical-align:top;">الرسالة</td>
                <td style="padding:12px 16px;">${(formData.message || "—").replace(/\n/g, "<br>")}</td>
              </tr>
              ${formData.voiceNote ? `
              <tr>
                <td style="padding:12px 16px;background:#fff3cd;font-weight:bold;">ملاحظة</td>
                <td style="padding:12px 16px;background:#fff3cd;">🎙️ أرسل رسالة صوتية — راجع الأدمن لتشغيلها</td>
              </tr>` : ""}
            </table>
            <div style="margin-top:20px;text-align:center;">
              <a href="${chatUrl}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">فتح صفحة الدردشة</a>
              &nbsp;
              <a href="https://wa.me/${formData.phone?.replace(/\D/g, "")}" style="display:inline-block;background:#25d366;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">واتساب</a>
            </div>
            <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px;">webistrydev.com/admin — كلمة المرور: 114891</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("[leads] Email notification failed:", emailErr);
    }
  }

  return { success: true, chatToken };
}
