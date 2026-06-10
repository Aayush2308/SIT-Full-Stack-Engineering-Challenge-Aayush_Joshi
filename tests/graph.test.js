import assert from "node:assert/strict";
import { processGraph } from "../src/processGraph.js";

const profile = {
  user_id: "johndoe_19990917",
  email_id: "john.doe@university.edu",
  enrollment_number: "21BCE1001"
};

const response = processGraph(
  {
    edges: [
      "A->B", "A->C", "B->D", "C->E", "E->F",
      "X->Y", "Y->Z", "Z->X",
      "P->Q", "Q->R",
      "G->H", "G->H", "G->I",
      "hello", "1->2", "A->"
    ]
  },
  profile
);

assert.equal(response.user_id, "johndoe_19990917");
assert.deepEqual(response.invalid_entries, ["hello", "1->2", "A->"]);
assert.deepEqual(response.duplicate_edges, ["G->H"]);
assert.deepEqual(response.summary, {
  total_trees: 3,
  total_cycles: 1,
  largest_tree_root: "A"
});
assert.equal(response.hierarchies.find((item) => item.root === "A").depth, 4);
assert.equal(response.hierarchies.find((item) => item.root === "X").has_cycle, true);

const multiParent = processGraph({ edges: ["A->D", "B->D", "B->C"] }, profile);
assert.deepEqual(multiParent.hierarchies.find((item) => item.root === "A").tree, { A: { D: {} } });
assert.deepEqual(multiParent.hierarchies.find((item) => item.root === "B").tree, { B: { C: {} } });

console.log("All graph tests passed.");
