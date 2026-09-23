/**
 * Interactive admin account creator.
 *
 *   npm run create-admin
 *
 * Prompts for name, email and password on the terminal and creates (or
 * promotes) an admin user. Never hardcode admin credentials into the repo —
 * this script is the supported way to create the first admin account on a
 * fresh deployment.
 */
import { createInterface } from "readline/promises";
import { stdin, stdout } from "process";
import { connectStandalone, disconnectStandalone } from "./db";
import User from "../src/models/User";
import { hashPassword } from "../src/lib/auth";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function promptHidden(rl: ReturnType<typeof createInterface>, question: string): Promise<string> {
  // Basic non-echoing password prompt for POSIX terminals; falls back to
  // plain input if the terminal doesn't support raw mode (e.g. some CI shells).
  return new Promise((resolve) => {
    const anyStdin = stdin as unknown as { isTTY?: boolean; setRawMode?: (v: boolean) => void };
    if (!anyStdin.isTTY || !anyStdin.setRawMode) {
      rl.question(question).then(resolve);
      return;
    }
    stdout.write(question);
    let input = "";
    anyStdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (char: string) => {
      if (char === "\n" || char === "\r" || char === "\u0004") {
        anyStdin.setRawMode?.(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        stdout.write("\n");
        resolve(input);
        return;
      }
      if (char === "\u0003") {
        process.exit(1);
      }
      if (char === "\u007f") {
        input = input.slice(0, -1);
        return;
      }
      input += char;
    };
    stdin.on("data", onData);
  });
}

async function main() {
  const rl = createInterface({ input: stdin, output: stdout });

  console.log("\n=== Anime & Toy Universe — Create Admin Account ===\n");

  let name = "";
  while (!name.trim()) {
    name = (await rl.question("Admin full name: ")).trim();
  }

  let email = "";
  while (!isValidEmail(email)) {
    email = (await rl.question("Admin email: ")).trim().toLowerCase();
    if (!isValidEmail(email)) console.log("Please enter a valid email address.");
  }

  let password = "";
  while (password.length < 8) {
    password = await promptHidden(rl, "Admin password (min 8 characters): ");
    if (password.length < 8) console.log("Password must be at least 8 characters.");
  }

  rl.close();

  await connectStandalone();

  const existing = await User.findOne({ email });
  const passwordHash = await hashPassword(password);

  if (existing) {
    existing.name = name;
    existing.passwordHash = passwordHash;
    existing.role = "admin";
    existing.isActive = true;
    await existing.save();
    console.log(`\n✔ Existing user "${email}" updated and promoted to admin.\n`);
  } else {
    await User.create({ name, email, passwordHash, role: "admin" });
    console.log(`\n✔ Admin account created for "${email}".\n`);
  }

  await disconnectStandalone();
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to create admin account:", err);
  process.exit(1);
});
