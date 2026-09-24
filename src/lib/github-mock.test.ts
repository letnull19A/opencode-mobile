import { test } from "node:test"
import assert from "node:assert/strict"
import { filterMockRepos, MOCK_REPOS } from "./github-mock.ts"

test("filterMockRepos: empty query returns all", () => {
  assert.equal(filterMockRepos("").length, MOCK_REPOS.length)
})

test("filterMockRepos: matches by name/fullName/description", () => {
  assert.ok(filterMockRepos("opencode-mobile").length >= 1)
  assert.ok(filterMockRepos("sst/").some((r) => r.fullName === "sst/opencode"))
})

test("filterMockRepos: no match returns empty", () => {
  assert.equal(filterMockRepos("zzz-no-such-repo").length, 0)
})
