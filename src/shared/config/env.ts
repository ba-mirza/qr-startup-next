const required = (name: string, value: string | undefined): string => {
  if (!value) throw new Error(`Переменная окружения ${name} не задана, см. .env.example`);
  return value;
};

// NEXT_PUBLIC_* подставляются при сборке только при прямом обращении к process.env.X.
export const env = {
  supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseKey: required(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ),
};
