import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = resolve(process.cwd(), "supabase/migrations/0002_papers_rls.sql");

describe("papers RLS migration", () => {
  it("allows the MVP client to read, insert, and delete papers", () => {
    const migration = readFileSync(migrationPath, "utf8");

    expect(migration).toContain("alter table public.papers enable row level security;");
    expect(migration).toContain('create policy "MVP paper select"');
    expect(migration).toContain('create policy "MVP paper insert"');
    expect(migration).toContain('create policy "MVP paper delete"');
    expect(migration).toMatch(/to anon, authenticated/);
  });
});
