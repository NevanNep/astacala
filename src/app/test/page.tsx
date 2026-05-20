"use client";

import { createClient } from "../../utils/supabase/client";

export default function TestPage() {
    const handleClick = async () => {
        const supabase = createClient();

        const { data, error } = await supabase.auth.getSession();

        console.log(data);
        console.log(error);

        alert("Supabase connected!");
    };

    return (
        <div className="p-10">
            <button
                onClick={handleClick}
                className="bg-black text-white px-4 py-2 rounded"
            >
                Test Supabase
            </button>
        </div>
    );
}