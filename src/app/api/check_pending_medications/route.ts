import { createClient } from "@supabase/supabase-js";
import sgMail from "@sendgrid/mail";
import { NextResponse } from "next/server";

type ReminderLog = {
    id: string;
    scheduled_at: string;
    medications: {
        name: string;
        dosage: string;
    }[];
    users: {
        email: string | null;
    }[];
};


export async function GET() {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

        const now = new Date();
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
            .from("medication_logs")
            .select(`
        id,
        scheduled_at,
        medications!inner (
          name,
          dosage
        ),
        users!inner (
          email
        )
      `)
            .gte("scheduled_at", startOfToday.toISOString())
            .lte("scheduled_at", now.toISOString())
            .eq("status", "pending")
            .eq("reminder_sent", false);

        if (error) throw error;
        if (!data || data.length === 0) {
            return NextResponse.json({
                message: "No reminders to send",
            });
        }

        const logs: ReminderLog[] = data;
        let sentCount = 0;

        for (const log of logs) {
            const medication = log.medications?.[0];
            const user = log.users?.[0];

            if (!medication || !user?.email) continue; 

            const msg = {
                to: user.email,
                from: "anujsingh.devx@gmail.com",
                subject: "Medication Reminder 💊",
                text: `Reminder to take ${medication.name} (${medication.dosage})`,
                html: `
                       <h2>Medication Reminder 💊</h2>
                       <p>Please take your medication:</p>
                       <strong>${medication.name}</strong><br/>
                       Dosage: ${medication.dosage}
                      `,
             };

            await sgMail.send(msg);

            await supabase
                .from("medication_logs")
                .update({ reminder_sent: true })
                .eq("id", log.id)
                .eq("reminder_sent", false);

            sentCount++;
        }

        return NextResponse.json({
            message: `Sent ${sentCount} reminder(s) successfully`,
        });

    } catch (err) {
        console.error("Reminder error:", err);
        return NextResponse.json(
            { error: "REMINDER_PROCESS_FAILED" },
            { status: 500 }
        );
    }
}
