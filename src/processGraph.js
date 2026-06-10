const EDGE_PATTERN = /^[A-Z]->[A-Z]$/;

export function processGraph(body, profile) {
  if (!body || !Array.isArray(body.edges)) {
    throw new Error("Request body must contain an edges array.");
  }

  const invalid_entries = [];
  const duplicate_edges = [];
  const duplicateSeen = new Set();
  const edgeSeen = new Set();
  const parentByChild = new Map();
  const childrenByParent = new Map();
  const nodes = new Set();

  for (const value of body.edges) {
    const entry = String(value ?? "").trim();

    if (!EDGE_PATTERN.test(entry)) {
      invalid_entries.push(entry);
      continue;
    }

    const [parent, child] = entry.split("->");
    if (parent === child) {
      invalid_entries.push(entry);
      continue;
    }

    if (edgeSeen.has(entry)) {
      if (!duplicateSeen.has(entry)) {
        duplicate_edges.push(entry);
        duplicateSeen.add(entry);
      }
      continue;
    }
    edgeSeen.add(entry);

    if (parentByChild.has(child)) {
      continue;
    }

    parentByChild.set(child, parent);
    nodes.add(parent);
    nodes.add(child);

    if (!childrenByParent.has(parent)) {
      childrenByParent.set(parent, []);
    }
    childrenByParent.get(parent).push(child);
  }

  for (const children of childrenByParent.values()) {
    children.sort();
  }

  const groups = findGroups(nodes, childrenByParent);
  const hierarchies = groups.map((group) => buildHierarchy(group, parentByChild, childrenByParent));
  hierarchies.sort((a, b) => a.root.localeCompare(b.root));

  const nonCyclic = hierarchies.filter((item) => !item.has_cycle);
  const largest = nonCyclic
    .slice()
    .sort((a, b) => b.depth - a.depth || a.root.localeCompare(b.root))[0];

  return {
    user_id: profile.user_id,
    email_id: profile.email_id,
    enrollment_number: profile.enrollment_number,
    hierarchies,
    invalid_entries,
    duplicate_edges,
    summary: {
      total_trees: nonCyclic.length,
      total_cycles: hierarchies.length - nonCyclic.length,
      largest_tree_root: largest ? largest.root : ""
    }
  };
}

function findGroups(nodes, childrenByParent) {
  const undirected = new Map();

  for (const node of nodes) {
    undirected.set(node, new Set());
  }

  for (const [parent, children] of childrenByParent.entries()) {
    for (const child of children) {
      undirected.get(parent).add(child);
      undirected.get(child).add(parent);
    }
  }

  const groups = [];
  const visited = new Set();
  const sortedNodes = [...nodes].sort();

  for (const start of sortedNodes) {
    if (visited.has(start)) continue;

    const group = [];
    const stack = [start];
    visited.add(start);

    while (stack.length) {
      const node = stack.pop();
      group.push(node);

      for (const next of undirected.get(node)) {
        if (!visited.has(next)) {
          visited.add(next);
          stack.push(next);
        }
      }
    }

    groups.push(group.sort());
  }

  return groups;
}

function buildHierarchy(group, parentByChild, childrenByParent) {
  const roots = group.filter((node) => !parentByChild.has(node)).sort();
  const root = roots[0] || group[0];

  if (hasCycle(root, childrenByParent, new Set(), new Set())) {
    return { root, tree: {}, has_cycle: true };
  }

  return {
    root,
    tree: { [root]: buildTree(root, childrenByParent) },
    depth: getDepth(root, childrenByParent)
  };
}

function hasCycle(node, childrenByParent, visiting, visited) {
  if (visiting.has(node)) return true;
  if (visited.has(node)) return false;

  visiting.add(node);
  for (const child of childrenByParent.get(node) || []) {
    if (hasCycle(child, childrenByParent, visiting, visited)) {
      return true;
    }
  }
  visiting.delete(node);
  visited.add(node);

  return false;
}

function buildTree(node, childrenByParent) {
  const tree = {};
  for (const child of childrenByParent.get(node) || []) {
    tree[child] = buildTree(child, childrenByParent);
  }
  return tree;
}

function getDepth(node, childrenByParent) {
  const children = childrenByParent.get(node) || [];
  if (children.length === 0) return 1;
  return 1 + Math.max(...children.map((child) => getDepth(child, childrenByParent)));
}
