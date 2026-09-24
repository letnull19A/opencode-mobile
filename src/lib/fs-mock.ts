// Mock server filesystem for the directory explorer UI stub.
// Backend will later serve real data via opencode API:
//   GET /file?path=.  -> FileEntry[] (see sdk.ts file.list)
//   GET /file/roots   -> FileRoot[]  (see sdk.ts file.roots, 404-tolerant)
//   GET /path          -> { home, ... } (see sdk.ts path.get)
// When the backend lands, drop `useMock` from DirectoryBrowserSheet callers —
// the mock shapes below mirror the real API shapes so screens don't change.

import type { FileEntry } from "./sdk"
import type { FileRoot } from "./file-roots"

export const MOCK_HOME = "/home/user"

export const MOCK_ROOTS: FileRoot[] = [
  { path: "/home/user", label: "Home" },
  { path: "/home/user/projects", label: "projects" },
  { path: "/home/user/work", label: "work" },
]

// dir -> immediate child directory names
const MOCK_TREE: Record<string, string[]> = {
  "/": ["home"],
  "/home": ["user"],
  "/home/user": ["projects", "work", "notes"],
  "/home/user/projects": ["opencode-mobile", "dotfiles", "landing"],
  "/home/user/projects/opencode-mobile": ["app", "src", "scripts"],
  "/home/user/projects/opencode-mobile/app": ["project", "session"],
  "/home/user/projects/opencode-mobile/src": ["components", "lib", "stores"],
  "/home/user/projects/dotfiles": ["nvim", "tmux"],
  "/home/user/projects/landing": [],
  "/home/user/work": ["api-gateway", "ml-pipeline"],
  "/home/user/work/api-gateway": ["cmd", "internal"],
  "/home/user/work/ml-pipeline": ["pipelines", "evals"],
  "/home/user/notes": [],
}

export function listMockDir(dir: string): FileEntry[] {
  const children = MOCK_TREE[dir]
  if (!children) return []
  return children.map((name) => ({
    name,
    path: `${dir}/${name}`,
    absolute: `${dir}/${name}`,
    type: "directory" as const,
    ignored: name.startsWith("."),
  }))
}
