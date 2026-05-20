import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/src/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama, email, password, confirmPassword } = body;

    // Server-side Validation
    if (!nama || !nama.trim()) {
      return NextResponse.json(
        { error: "Nama tidak boleh kosong", field: "nama" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return NextResponse.json(
        { error: "Email tidak boleh kosong", field: "email" },
        { status: 400 }
      );
    } else if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid", field: "email" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Password tidak boleh kosong", field: "password" },
        { status: 400 }
      );
    } else if (password.length < 8) {
      return NextResponse.json(
        { error: "Password minimal 8 karakter", field: "password" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Password tidak cocok", field: "confirmPassword" },
        { status: 400 }
      );
    }

    const supabase = createClient(await cookies());

    // Supabase auth signup logic
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nama }
      }
    });

    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        return NextResponse.json(
          { error: "Email sudah terdaftar", field: "email" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Profiles table insert (fallback/explicit insert as requested)
    // The DB trigger usually handles this, but we do an upsert or ignore error 
    // to fulfill the "profiles table insert" requirement robustly.
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          nama: nama.trim()
        });

      // We don't fail the request if the profile insert fails because 
      // the DB trigger might have already created it (trigger throws constraint error).
      if (profileError && profileError.code !== '23505') {
        console.error("Profile insert error:", profileError);
      }
    }

    return NextResponse.json(
      {
        message: "Registrasi berhasil",
        user: data.user,
        session: data.session,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
