import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildOutlineTree,
  flattenOutlineTree,
  newOutlineRow,
  organizationalDocumentHref,
} from "../lib/organizational-document";

const outline = [
  {
    title: "Pedoman Dasar",
    page: 46,
    children: [
      { title: "Mukadimah", page: 46, children: [] },
      {
        title: "BAB II",
        page: 47,
        children: [{ title: "Pasal 1", page: 47, children: [] }],
      },
    ],
  },
  { title: "Mars KOHATI", page: 69, children: [] },
];

test("outline survives a flatten and rebuild unchanged", () => {
  const rows = flattenOutlineTree(outline);
  assert.deepEqual(
    rows.map((row) => [row.title, row.depth]),
    [
      ["Pedoman Dasar", 0],
      ["Mukadimah", 1],
      ["BAB II", 1],
      ["Pasal 1", 2],
      ["Mars KOHATI", 0],
    ]
  );
  assert.deepEqual(buildOutlineTree(rows), outline);
});

test("a row nests under the nearest shallower row above it", () => {
  const tree = buildOutlineTree([
    newOutlineRow(0, " BAB I ", "1"),
    newOutlineRow(1, "Pasal 1", "2"),
    newOutlineRow(0, "BAB II", "3"),
  ]);
  assert.deepEqual(tree, [
    {
      title: "BAB I",
      page: 1,
      children: [{ title: "Pasal 1", page: 2, children: [] }],
    },
    { title: "BAB II", page: 3, children: [] },
  ]);
});

test("document links fall back to a readable slug", () => {
  assert.equal(
    organizationalDocumentHref({ id: 7, slug_url: "pdk-ambon" }),
    "/organizational-documents/pdk-ambon/7"
  );
  assert.equal(
    organizationalDocumentHref({ id: 7, slug_url: "" }),
    "/organizational-documents/pedoman/7"
  );
});
